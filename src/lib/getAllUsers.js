import getTable from './aws/db/getTable'

async function getAllUsers() {
    const response = {
        status: false,
        users: [],
        message: ''
    }
    const users = await getTable('Users')
    if (users.length > 0) {
        for (const user of users) {
            delete user['auth_id']
            delete user['auth_source']
            response.users.push(user)
        }
        response.status = true
    }
    else {
        response.message = 'no users found.'
    }

    return response
}

export { getAllUsers }