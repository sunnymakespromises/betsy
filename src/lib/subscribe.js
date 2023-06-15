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
        const betsyUser = await getItem('Users', { auth_id: authUser.id }, ['id', 'subscriptions'])
        if (betsyUser) {
            if (betsyUser.id !== targetId) {
                const targetUser = await getItem('Users', targetId)
                if (targetUser) {
                    if (!(targetUser.subscribers.some(s => s.id === betsyUser.id))) {
                        response.status = true
                        await updateItem('Users', targetUser.id, { subscribers: [...targetUser.subscribers, { id: betsyUser.id, username: betsyUser.username, display_name: betsyUser.display_name }] })
                        await updateItem('Users', betsyUser.id, { subscriptions: [...betsyUser.subscriptions, { id: targetUser.id, username: targetUser.username, display_name: targetUser.display_name }] })
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
            response.message = 'user does not exist.'
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
        const betsyUser = await getItem('Users', { auth_id: authUser.id }, ['id', 'subscriptions'])
        if (betsyUser) {
            if (betsyUser.id !== targetId) {
                const targetUser = await getItem('Users', targetId)
                if (targetUser) {
                    if (targetUser.subscribers.some(s => s.id === betsyUser.id)) {
                        await updateItem('Users', targetUser.id, { subscribers: targetUser.subscribers.filter(subscriber => subscriber.id !== betsyUser.id)})
                        await updateItem('Users', betsyUser.id, { subscriptions: betsyUser.subscriptions.filter(subscription => subscription.id !== targetUser.id)})
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
            response.message = 'user does not exist.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export { subscribe, unsubscribe }