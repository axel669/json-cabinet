import { MongoClient } from "mongodb"
import { v4 as uuid } from "uuid"
import hydra from "/opt/hydra/index.mjs"

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
    const err = { ...props }
    err[errorKey] = true
    return err
}
const Err = (value) => value[errorKey] === true

const response = (statusCode, data) => ({
    statusCode,
    body: JSON.stringify(data)
})

const commands = {
    "account.read": async (user, args) => {
        const accountInfo = await accounts.findOne({
            active: true,
            clientID: user.userID,
        })

        return response(200, accountInfo)
    },
    "account.activate": async (user, args) => {
        const result = await accounts.updateOne(
            {
                clientID: user.userID,
            },
            {
                $set: {
                    active: true,
                },
                $setOnInsert: {
                    type: "free",
                    used: 0,
                    max: 25000,
                    keys: {}
                }
            },
            { upsert: true }
        )

        return response(200, true)
    },
    "account.deactivate": async (user, args) => {
        const result = await accounts.updateOne(
            {
                clientID: user.userID,
            },
            {
                $set: {
                    active: false,
                }
            },
        )

        return response(200, true)
    },
    "apikey.add": async (user, args) => {
        const key = uuid()
        const result = await accounts.updateOne(
            {
                clientID: user.userID,
                active: true,
            },
            {
                $set: {
                    [`keys.${key}`]: {
                        prefix: args.prefix,
                        name: args.name,
                        created: Date.now()
                    }
                }
            }
        )

        return response(200, true)
    },
    "apikey.remove": async (user, args) => {
        const result = await accounts.updateOne(
            {
                clientID: user.userID,
                active: true,
            },
            {
                $unset: {
                    [`keys.${args.key}`]: ""
                }
            }
        )

        return response(200, true)
    }
}

export async function handler(event) {
    const command = event.pathParameters.command

    if (commands.hasOwnProperty(command) === false) {
        return response(400, "Invalid command")
    }

    const user = hydra(event)
    return await commands[command](
        user,
        JSON.parse(event.body)
    )
}
