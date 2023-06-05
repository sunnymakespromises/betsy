import AWS from 'aws-sdk'
const REGION = 'us-east-1'

const getBucket = (S3_BUCKET) => {
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    })
    return new AWS.S3({
        params: { Bucket: S3_BUCKET},
        region: REGION,
    })
}

export { getBucket }