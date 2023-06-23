import { S3Client } from '@aws-sdk/client-s3'

const REGION = 'us-east-1'
const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
})

export default s3