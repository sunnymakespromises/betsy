import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { ddbClient } from './ddbConfig.js'

const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: true,
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: false,
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: true
}

const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false
}

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions,
    unmarshallOptions,
})

export { ddbDocClient }