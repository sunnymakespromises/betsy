import authenticateUser from './auth/authenticateUser'
import updateItem from './aws/db/updateItem'
import getItem from './aws/db/getItem'

async function subscribe(refresh_token, source, targetId) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        const betsyUser = await getItem('Users', { auth_id: authUser.id })
        if (betsyUser.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                if (!targetUser.subscriptions.includes(betsyUser.id)) {
                    response.status = true
                    await updateItem('Users', targetUser.id, { subscribers: [...targetUser.subscribers, betsyUser.id] })
                    await updateItem('Users', betsyUser.id, { subscriptions: [...betsyUser.subscriptions, targetUser.id] })
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

async function unsubscribe(refresh_token, source, targetId) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        const betsyUser = await getItem('Users', { auth_id: authUser.id })
        if (betsyUser.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                if (targetUser.subscribers.includes(betsyUser.id)) {
                    await updateItem('Users', targetUser.id, { subscribers: targetUser.subscribers.filter(s => s !== betsyUser.id)})
                    await updateItem('Users', betsyUser.id, { subscriptions: targetUser.subscriptions.filter(s => s !== targetUser.id)})
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