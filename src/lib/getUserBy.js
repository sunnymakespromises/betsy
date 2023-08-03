import getItem from './aws/db/getItem'
import queryTable from './aws/db/queryTable'
import getItems from './aws/db/getItems'

async function getUserBy(key, value) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    let user
    if (key === 'id') {
        user = await getItem('users', value, ['id', 'balances', 'display_name', 'favorites', 'is_locked', 'join_date', 'picture', 'slips'])
    }
    else {
        user = await queryTable('users', [key] + ' = ' + value, ['id', 'balances', 'display_name', 'favorites', 'is_locked', 'join_date', 'picture', 'slips'], true)
    }
    if (user) {
        response.status = true
        response.user = user
        for (const category of Object.keys(user.favorites).filter(category => user.favorites[category].length > 0)) {
            response.user.favorites[category] = await getItems(category, user.favorites[category], ['id', 'name', 'picture'])
        } 
    }
    else {
        response.message = 'no user found with that ' + key + '.'
    }

    return response
}

export { getUserBy }