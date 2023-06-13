import authenticateUser from './auth/authenticateUser'
import insertItem from './aws/db/insertItem'
import getItem from './aws/db/getItem'
import deleteItem from './aws/db/deleteItem'
import queryTable from './aws/db/queryTable'
const short = require('short-uuid')

async function subscribe(refresh_token, targetId) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token)
    if (authUser) {
        if (authUser.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                if ((await queryTable('Subscriptions', { subscriber: authUser.id, subscribee: targetUser.id })).length === 0) {
                    response.status = true
                    const item = {
                        id: short.generate(),
                        subscriber: authUser.id,
                        subscribee: targetUser.id
                    }
                    await insertItem('Subscriptions', item)
                }
                else {
                    response.message = 'user is already subscribed to the user with id ' + targetId + '.'
                }
            }
            else {
                response.message = 'the user with id ' + targetId + ' does not exist.'
            }
        }
        else {
            response.message = 'user cannot subscribe to themselves.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

async function unsubscribe(refresh_token, targetId) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token)
    if (authUser) {
        if (authUser.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                const subscription = (await queryTable('Subscriptions', { subscriber: authUser.id, subscribee: targetUser.id }))
                if (subscription.length > 0) {
                    await deleteItem('Subscriptions', subscription[0].id)
                    response.status = true
                }
                else {
                    response.message = 'user is not subscribed to the user with id ' + targetId + '.'
                }
            }
            else {
                response.message = 'the user with id ' + targetId + ' does not exist.'
            }
        }
        else {
            response.message = 'user cannot unsubscribe from themselves.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export { subscribe, unsubscribe }