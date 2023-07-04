import authenticateUser from './authenticateUser'
import insertItem from '../aws/db/insertItem'
import queryTable from '../aws/db/queryTable'
import now from '../util/now'
const short = require('short-uuid')

async function getCurrentUser(refresh_token, source) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        let betsyUser = await queryTable('Users', 'auth_id = ' + authUser.id, null, true)
        if (betsyUser) {
            response.status = true
            response.user = betsyUser
        }
        else {
            const id = short.generate()
            const item = {
                id: id,
                join_date: now(),
                username: id.substring(0, 8),
                display_name: 'user' + id.substring(0, 8),
                bio: 'my bio 💕',
                email: authUser.email,
                picture: authUser.picture,
                auth_id: authUser.id,
                auth_source: source,
                notifications: [{ category: 'welcome', timestamp: now(), title: 'Welcome to Betsy10!', message: 'This is where your notifications live!', read: false }],
                settings: {
                    notifications: 'Off'
                },
                subscribers: [],
                subscriptions: [],
                favorites: {
                    competitions: [],
                    competitors: []
                },
                slips: [],
                balance: 10.00,
                is_locked: false,
                is_dev: false
            }
            await insertItem('Users', item)
            response.status = true
            response.user = item
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export default getCurrentUser