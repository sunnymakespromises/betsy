import updateItem from './aws/db/updateItem'
import getItem from './aws/db/getItem'

async function subscribe(user, targetId) {
    const response = {
        status: false,
        changes: null,
        message: ''
    }
    if (user) {
        if (user.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                if (!(targetUser.subscribers.some(s => s.id === user.id))) {
                    let updatedTargetSubscribers = [...targetUser.subscribers, { id: user.id, username: user.username, display_name: user.display_name, picture: user.picture }]
                    await updateItem('Users', targetUser.id, { subscribers: updatedTargetSubscribers })
                    let updatedUserSubscriptions = [...user.subscriptions, { id: targetUser.id, username: targetUser.username, display_name: targetUser.display_name, picture: targetUser.picture }]
                    await updateItem('Users', user.id, { subscriptions: updatedUserSubscriptions })
                    response.changes = { subscriptions: updatedUserSubscriptions }
                    response.status = true
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

    return response
}

async function unsubscribe(user, targetId) {
    const response = {
        status: false,
        changes: null,
        message: ''
    }
    if (user.id !== targetId) {
        const targetUser = await getItem('Users', targetId)
        if (targetUser) {
            if (targetUser.subscribers.some(s => s.id === user.id)) {
                let updatedTargetSubscribers = targetUser.subscribers.filter(subscriber => subscriber.id !== user.id)
                await updateItem('Users', targetUser.id, { subscribers: updatedTargetSubscribers})
                let updatedUserSubscriptions = user.subscriptions.filter(subscription => subscription.id !== targetUser.id)
                await updateItem('Users', user.id, { subscriptions: updatedUserSubscriptions})
                response.changes = { subscriptions: updatedUserSubscriptions }
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

    return response
}

export { subscribe, unsubscribe }