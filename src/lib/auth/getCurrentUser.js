import authenticateUser from './authenticateUser'
import insertItem from '../aws/db/insertItem'
import getItem from '../aws/db/getItem'
const short = require('short-uuid')

async function getCurrentUser(refresh_token, source) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        const betsyUser = await getItem('Users', { auth_id: authUser.id })
        if (betsyUser) {
            response.status = true
            response.user = betsyUser
        }
        else {
            const item = {
                id: short.generate(),
                username: authUser.name.replace(/[^A-Za-z0-9-_.]/g, '').substring(0, ),
                display_name: authUser.name.replace(/[^A-Za-z0-9-_.]/g, '').substring(0, ),
                bio: 'this is my bio 😎',
                email: authUser.email,
                picture: authUser.picture,
                auth_id: authUser.id,
                auth_source: source,
                subscribers: [],
                subscriptions: [],
                favorites: [],
                slips: [],
                balance: 0.00
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