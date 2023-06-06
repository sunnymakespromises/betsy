import { getBucket } from './getBucket'

export default async function removeFile(S3_BUCKET, fileName) {
    const bucket = getBucket(S3_BUCKET)
    const params = {
        Bucket: S3_BUCKET,
        Key: fileName
    }

    return await bucket.deleteObject(params).promise().then(function(data) {
        if (data) {
            return true
        }
    })
}