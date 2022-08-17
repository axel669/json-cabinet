import { MongoClient } from "mongodb"

const mongo = new MongoClient(
    process.env.mongo,
    { useNewUrlParser: true, useUnifiedTopology: true }
)
await mongo.connect()

const db = mongo.db("json-cabinet")
const accounts = db.collection("accounts")
const files = db.collection("files")

const errorKey = Symbol()
const error = (props) => {
    const err = {...props}
    err[errorKey] = true
    return err
}
const Err = (value) => value[errorKey] === true
const response = (statusCode, data) => ({
    statusCode,
    body: JSON.stringify(data)
})

const handlers = {
    get: async ({ clientID, key, session, prefix }) => {
        const file = await files.findOne(
            {
                key,
                clientID,
                prefix,
            },
            {
                value: true,
                session,
            }
        )

        const value = (file === null) ? null : file.value

        return response(200, value)
    },
    post: async ({ clientID, key, event, session, prefix }) => {
        try {
            const value = JSON.parse(event.body)

            await files.updateOne(
                { clientID, key, prefix },
                { $set: { value } },
                {
                    upsert: true,
                    session,
                }
            )

            return response(200, { success: true })
        }
        catch (err) {
            console.error(err)
            return error({
                code: 400,
                message: err.message
            })
        }
    }
}

const handle = async (info) => {
    const { apiKey, clientID, event, session} = info

    const method = event.requestContext.http.method.toLowerCase()

    const { value: account } = await accounts.findOneAndUpdate(
        {
            clientID,
            active: true,
            [`keys.${apiKey}`]: { $exists: true }
        },
        [{
            $set: {
                used: {
                    $sum: [
                        "$used",
                        {
                            $cond: {
                                if: {
                                    $or: [
                                        {
                                            $and: [
                                                { $ne: ["$max", null] },
                                                { $lt: ["$used", "$max"]}
                                            ]
                                        },
                                        { $eq: ["$max", null] }
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    ]
                }
            }
        }],
        {
            session,
        }
    )

    if (account === null) {
        return error({
            code: 401,
            message: "Invalid Credentials"
        })
    }

    if (account.max === account.used) {
        return error({
            code: 401,
            message: "Request limit reached"
        })
    }

    const key = event.pathParameters.key
    const prefix = account.keys[apiKey].prefix

    return await handlers[method]({clientID, key, prefix, event, session})
}

export async function handler(event) {
    if (event.body !== undefined && event.body.length > 10 * 1024) {
        return response(400, "Payload too large")
    }
    const apiKey = event.headers.apikey
    const clientID = event.headers.clientid

    if (apiKey === undefined || clientID === undefined) {
        return response(401, "Invalid Credentials")
    }

    const session = mongo.startSession()
    session.startTransaction()

    const res = await handle({
        apiKey,
        clientID,
        session,
        event,
    })

    if (Err(res) === true) {
        await session.abortTransaction()
        await session.endSession()

        return response(res.code, res.message)
    }

    await session.commitTransaction()
    await session.endSession()

    return res
}
