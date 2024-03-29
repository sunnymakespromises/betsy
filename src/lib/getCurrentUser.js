import authenticateUser from './auth/authenticateUser'
import getItems from './aws/db/getItems'
import insertItem from './aws/db/insertItem'
import queryTable from './aws/db/queryTable'
import now from './util/now'
const short = require('short-uuid')

async function getCurrentUser(refresh_token, source) {
    const response = {
        status: false,
        user: null,
        newUser: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        let betsyUser = await queryTable('users', 'auth_id = ' + authUser.id, null, true)
        if (betsyUser) {
            response.status = true
            response.user = betsyUser
            response.user.subscriptions = betsyUser.subscriptions.length > 0 ? await queryTable('users', 'id in ' + JSON.stringify(betsyUser.subscriptions), ['id', 'display_name', 'picture']) : []
            for (const category of Object.keys(betsyUser.favorites).filter(category => betsyUser.favorites[category].length > 0)) {
                response.user.favorites[category] = await getItems(category, betsyUser.favorites[category], ['id', 'name', 'picture'])
            }
            if (betsyUser.slips.length > 0) {
                response.user.slips = await getItems('slips', betsyUser.slips, null)
            }
        }
        else {
            const id = short.generate()
            const item = {
                id: id.substring(0, 6),
                join_date: now(),
                display_name: 'user' + id.substring(0, 6),
                email: authUser.email,
                picture: authUser.picture,
                auth_id: authUser.id,
                auth_source: source,
                notifications: [{ id: short.generate(), category: 'welcome', timestamp: now(), title: 'Welcome to Betsy!', message: 'This is where your notifications live!', read: false }],
                settings: {
                    notifications: 'Off'
                },
                subscriptions: [],
                favorites: {
                    competitions: [],
                    competitors: []
                },
                slips: [],
                balances: [{ timestamp: now(), value: 10.00 }],
                is_locked: false,
                is_dev: false
            }
            await insertItem('users', item)
            response.status = true
            response.newUser = true
            response.user = item
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export default getCurrentUser