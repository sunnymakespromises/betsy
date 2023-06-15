import getItem from './aws/db/getItem'

async function getUserBy(key, value) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    const user = await getItem('Users', (key === 'id' ? value : { [key]: value }))
    if (user) {
        response.status = true
        delete user['auth_id']
        delete user['auth_source']
        response.user = user
    }
    else {
        response.message = 'no user found with that ' + key + '.'
    }

    return response
}

export { getUserBy }