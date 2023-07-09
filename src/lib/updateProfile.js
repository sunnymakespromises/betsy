import updateItem from './aws/db/updateItem'
import insertFile from './aws/s3/insertFile'
import removeFile from './aws/s3/removeFile'
const short = require('short-uuid')

async function updateProfile(user, key, value) {
    const response = {
        status: false,
        message: ''
    }
    switch (key) {
        case 'display_name':
            response.message = validate((value === ''), 'Display name cannot be empty.', response.message)
            response.message = validate((value.length < 1 || value.length > 16), 'Display name must be between 1 and 16 characters.', response.message)
            if (response.message === '') {
                await updateItem('Users', user.id, {display_name: value})
                response.status = true
            }
            break
        case 'picture':
            const fileName = short.generate() + '.png'
            const file = new File([await fetch(value).then(async res => await res.blob())], fileName, { type: "image/png" })
            if (user.picture.includes(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET)) {
                await removeFile(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET, user.picture.replace('https://' + process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET + '.s3.amazonaws.com/', ''))
            }
            if (await insertFile(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET, file)) {
                await updateItem('Users', user.id, {picture: 'https://' + process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET + '.s3.amazonaws.com/' + fileName})
                response.status = true
            }
            else {
                response.message = 'Error uploading image.'
            }
            break
        default:
            break
    }

    return response
}

function validate(invalid, message, oldMessage) {
    if (invalid) {
        return message
    }
    return oldMessage
}

export { updateProfile }