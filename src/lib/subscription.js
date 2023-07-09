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
                if (!user.subscriptions.some(subscription => subscription === targetUser.d)) {
                    let updatedUserSubscriptions = [...user.subscriptions, targetUser.id]
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
            if (user.subscriptions.some(subscription => subscription === targetUser.id)) {
                let updatedUserSubscriptions = user.subscriptions.filter(subscription => subscription !== targetUser.id)
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