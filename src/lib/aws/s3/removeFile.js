import s3 from './s3Config'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export default async function removeFile(S3_BUCKET, fileName) {
    const params = {
        Bucket: S3_BUCKET,
        Key: fileName
    }

    try {
        return await s3.send( new DeleteObjectCommand(params))
    } catch (err) {
        console.log('Error', err.stack)
    }
}