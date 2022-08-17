import { S3 } from "@aws-sdk/client-s3"
import { Response } from "node-fetch"

const s3 = new S3()

const reads3 = async (key) => {
    try {
        const result = await s3.getObject({
            Bucket: "pithos-storage.axel669.net",
            Key: key,
        })
        return await (new Response(result.Body).text())
    }
    catch (err) {
        if (err.name === "NoSuchKey") {
            return undefined
        }

        return err
    }
}

export default {
    get(event) {
        const value = await reads3(event.headers.key)

        return {
            statusCode: 200,
            body: (value === undefined) ? "{}" : `{"value":${value}}`
        }
    }
}
