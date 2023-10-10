import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const REGION = 'us-east-1'
const ddbClient = new DynamoDBClient({
    region: REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
})

export { ddbClient }