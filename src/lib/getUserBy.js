import getItem from './aws/db/getItem'
import queryTable from './aws/db/queryTable'

async function getUserBy(key, value) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    let user
    if (key === 'id') {
        user = await getItem('Users', value, ['id', 'balances', 'display_name', 'email', 'favorites', 'is_locked', 'join_date', 'picture', 'slips', 'subscriptions'])
    }
    else {
        user = await queryTable('Users', [key] + ' = ' + value, ['id', 'balances', 'display_name', 'email', 'favorites', 'is_locked', 'join_date', 'picture', 'slips', 'subscriptions'], true)
    }
    if (user) {
        response.status = true
        response.user = user
    }
    else {
        response.message = 'no user found with that ' + key + '.'
    }

    return response
}

export { getUserBy }