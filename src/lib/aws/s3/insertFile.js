import { getBucket } from './getBucket'

export default async function insertFile(S3_BUCKET, file) {
    const bucket = getBucket(S3_BUCKET)
    const params = {
        ACL: 'public-read',
        Body: file,
        Bucket: S3_BUCKET,
        Key: file.name
    }

    return await bucket.putObject(params).promise().then(function(data) {
        if (data) {
            return true
        }
    })
}