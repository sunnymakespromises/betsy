import getItem from './aws/db/getItem'

async function getUserBy(column, value) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    const user = await getItem('Users', { [column]: value })
    if (user) {
        response.status = true
        delete user['auth_id']
        delete user['auth_source']
        response.user = user
    }
    else {
        response.message = 'no user found with that ' + column + '.'
    }

    return response
}

export { getUserBy }