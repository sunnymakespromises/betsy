import { getBucket } from './getBucket'

export default async function insertFile(S3_BUCKET, file) {
    const bucket = getBucket(S3_BUCKET)
    const params = {
        ACL: 'public-read',
        Body: file,
        Bucket: S3_BUCKET,
        Key: file.name
    }

    bucket.putObject(params)
        .on('httpUploadProgress', (evt) => {
            
        })
        .send((err) => {
            if (err) console.log(err)
        })
}