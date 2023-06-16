import getItem from './aws/db/getItem'
import queryTable from './aws/db/queryTable'

async function getUserBy(key, value) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    let user = await getItem('Users', (key === 'id' ? value : { [key]: value }), ['id', 'balance', 'bio', 'display_name', 'email', 'favorites', 'is_locked', 'join_date', 'picture', 'slips', 'username'])
    if (user) {
        response.status = true
        user.subscriptions = await queryTable('Users', { mode: 'contains', subscribers: user.id }, ['id', 'username', 'display_name', 'picture'], false)
        user.subscribers = await queryTable('Users', { mode: 'contains', subscriptions: user.id }, ['id', 'username', 'display_name', 'picture'], false)
        response.user = user
    }
    else {
        response.message = 'no user found with that ' + key + '.'
    }

    return response
}

export { getUserBy }