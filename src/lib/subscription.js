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
            const targetUser = await getItem('users', targetId)
            if (targetUser) {
                // i get user subs in the expanded form (id, display_name, picture), but i need to store them in db as just ids, and then return it to the client as expanded
                if (!user.subscriptions.some(subscription => subscription.id === targetUser.id)) {
                    let updatedSubscriptions = [...(user.subscriptions?.map(subscription => subscription.id)), targetUser.id]
                    await updateItem('users', user.id, { subscriptions: updatedSubscriptions })
                    response.changes = { subscriptions: [...user.subscriptions, { id: targetUser.id, display_name: targetUser.display_name, picture: targetUser.picture }] }
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
        const targetUser = await getItem('users', targetId)
        if (targetUser) {
            // i get user subs in the expanded form (id, display_name, picture), but i need to store them in db as just ids, and then return it to the client as expanded
            if (user.subscriptions.some(subscription => subscription.id === targetUser.id)) {
                let updatedSubscriptions = user.subscriptions.filter(subscription => subscription.id !== targetUser.id)?.map(subscription => subscription.id)
                await updateItem('users', user.id, { subscriptions: updatedSubscriptions })
                response.changes = { subscriptions: user.subscriptions.filter(subscription => subscription.id !== targetUser.id) }
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