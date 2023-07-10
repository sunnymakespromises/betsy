import authenticateUser from './authenticateUser'
import insertItem from '../aws/db/insertItem'
import queryTable from '../aws/db/queryTable'
import now from '../util/now'
import _ from 'lodash'
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
        let betsyUser = await queryTable('Users', 'auth_id = ' + authUser.id, null, true)
        if (betsyUser) {
            response.status = true
            response.user = betsyUser
            response.user.subscriptions = betsyUser.subscriptions.length > 0 ? await queryTable('Users', 'id in ' + JSON.stringify(betsyUser.subscriptions), ['id', 'display_name', 'picture']) : []
            for (const category of Object.keys(betsyUser.favorites).filter(category => betsyUser.favorites[category].length > 0)) {
                response.user.favorites[category] = await queryTable(_.startCase(category), 'id in ' + JSON.stringify(betsyUser.favorites[category]), ['id', 'name', 'picture'])
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
            await insertItem('Users', item)
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