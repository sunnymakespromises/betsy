import authenticateUser from './authenticateUser'
import queryTable from './aws/db/queryTable'
import insertFile from './aws/s3/insertFile'
import updateItem from './aws/db/updateItem'

async function updateProfile(refresh_token, key, value) {
    const response = {
        status: false,
        message: ''
    }
    if (refresh_token !== undefined) {
        await authenticateUser(refresh_token, async (user) => {
            switch (key) {
                case 'username':
                    response.message = validate((value === ''), 'username cannot be empty.', response.message)
                    response.message = validate((value.length < 6 || value.length > 15), 'username must be between 5 and 16 characters.', response.message)
                    response.message = validate((!(/^[a-zA-Z0-9-_.]+$/.test(value))), 'username cannot contain any special characters.', response.message)
                    response.message = validate(((await queryTable('Users', { username: value })).length > 0), 'username already taken.', response.message)
                    if (response.message === '') {
                        await updateItem('Users', user.id, {username: value})
                        response.status = true
                    }
                    break
                case 'picture':
                    const blob = await fetch(value).then(async res => await res.blob())
                    const file = new File([blob], user.id + '.jpg', { type: "image/jpg" })
                    await insertFile(process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET, file)
                    if (blob && file) {
                        await updateItem('Users', user.id, {picture: 'https://' + process.env.REACT_APP_AWS_PROFILE_PICTURES_BUCKET + '.s3.amazonaws.com/' + user.id + '.jpg'})
                        response.status = true
                    }
                    else {
                        response.message = 'error uploading image.'
                    }
                    break
                default:
                    break
            }
        })
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