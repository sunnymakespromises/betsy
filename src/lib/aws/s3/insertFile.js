import s3 from './s3Config'
import { PutObjectCommand } from '@aws-sdk/client-s3'

export default async function insertFile(S3_BUCKET, file) {
    const params = {
        Body: file,
        Bucket: S3_BUCKET,
        Key: file.name
    }

    try {
        return await s3.send( new PutObjectCommand(params))
    } catch (err) {
        console.log('Error', err.stack)
    }
}