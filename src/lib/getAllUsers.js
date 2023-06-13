import getTable from './aws/db/getTable'

async function getAllUsers() {
    const response = {
        status: false,
        users: [],
        message: ''
    }
    const users = await getTable('Users')
    if (users.length > 0) {
        response.status = true
        response.users = users
    }
    else {
        response.message = 'no users found.'
    }

    return response
}

export { getAllUsers }