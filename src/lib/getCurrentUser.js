import authenticateUser from './authenticateUser'
import getItem from './aws/db/getItem'
import insertItem from './aws/db/insertItem'
import queryTable from './aws/db/queryTable'

async function getCurrentUser(refresh_token) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token)
    if (authUser) {
        const betsyUser = await getItem('Users', authUser.id)
        if (betsyUser) {
            response.status = true
            response.user = {
                ...betsyUser,
                subscriptions: {
                    subscribers: (await queryTable('Subscriptions', { subscribee: authUser.id })),
                    subscriptions: (await queryTable('Subscriptions', { subscriber: authUser.id })),
                },
                slips: [],
                balance: '0.00'
            }
        }
        else {
            const item = {
                'id': authUser.id,
                'username': authUser.name.replace(/[^A-Za-z0-9-_.]/g, '').substring(0, ),
                'displayname': authUser.name.replace(/[^A-Za-z0-9-_.]/g, '').substring(0, ),
                'bio': '✨💕',
                'email': authUser.email,
                'picture': authUser.picture
            }
            await insertItem('Users', item)
            response.status = true
            response.user = {
                ...item,
                subscriptions: {
                    subscribers: (await queryTable('Subscriptions', { subscribee: authUser.id })),
                    subscriptions: (await queryTable('Subscriptions', { subscriber: authUser.id })),
                },
                slips: [],
                balance: '0.00'
            }
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export default getCurrentUser