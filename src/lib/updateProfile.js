import authenticateUser from './authenticateUser'
import getItem from './aws/db/getItem'
import queryTable from './aws/db/queryTable'
import updateItem from './aws/db/updateItem'
import insertFile from './aws/s3/insertFile'
import removeFile from './aws/s3/removeFile'
const short = require('short-uuid')

async function updateProfile(refresh_token, column, value) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token)
    if (authUser) {
        const betsyUser = await getItem('Users', authUser.id)
        switch (column) {
            case 'username':
                response.message = validate((value === ''), 'username cannot be empty.', response.message)
                response.message = validate((value.length < 6 || value.length > 12), 'username must be between 5 and 13 characters.', response.message)
                response.message = validate((!(/^[a-zA-Z0-9-_.]+$/.test(value))), 'username cannot contain any special characters.', response.message)
                response.message = validate(((await queryTable('Users', { username: value })).length > 0), 'username already taken.', response.message)
                if (response.message === '') {
                    await updateItem('Users', betsyUser.id, {username: value})
                    response.status = true
                }
                break
            case 'picture':
                const fileName = short.generate() + '.jpg'
                const file = new File([await fetch(value).then(async res => await res.blob())], fileName, { type: "image/jpg" })
                if (betsyUser.picture.includes(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET)) {
                    await removeFile(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET, betsyUser.picture.replace('https://' + process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET + '.s3.amazonaws.com/', ''))
                }
                if (await insertFile(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET, file)) {
                    await updateItem('Users', betsyUser.id, {picture: 'https://' + process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET + '.s3.amazonaws.com/' + fileName})
                    response.status = true
                }
                else {
                    response.message = 'error uploading image.'
                }
                break
            default:
                break
        }
    }
    else {
        response.message = 'invalid refresh token.'
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