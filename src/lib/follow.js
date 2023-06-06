import authenticateUser from './authenticateUser'
import insertItem from './aws/db/insertItem'
import getItem from './aws/db/getItem'
import deleteItem from './aws/db/deleteItem'
import queryTable from './aws/db/queryTable'
const short = require('short-uuid')

async function follow(refresh_token, targetId) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token)
    if (authUser) {
        if (authUser.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                if ((await queryTable('Follows', { follower: authUser.id, followee: targetUser.id })).length === 0) {
                    response.status = true
                    const item = {
                        id: short.generate(),
                        follower: authUser.id,
                        followee: targetUser.id
                    }
                    await insertItem('Follows', item)
                }
                else {
                    response.message = 'user already follows user with id ' + targetId + '.'
                }
            }
            else {
                response.message = 'user with id ' + targetId + ' does not exist.'
            }
        }
        else {
            response.message = 'user cannot follow themselves.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

async function unfollow(refresh_token, targetId) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token)
    if (authUser) {
        if (authUser.id !== targetId) {
            const targetUser = await getItem('Users', targetId)
            if (targetUser) {
                const follow = (await queryTable('Follows', { follower: authUser.id, followee: targetUser.id }))
                if (follow.length > 0) {
                    await deleteItem('Follows', follow[0].id)
                    response.status = true
                }
                else {
                    response.message = 'user does not follow user with id ' + targetId + '.'
                }
            }
            else {
                response.message = 'user with id ' + targetId + ' does not exist.'
            }
        }
        else {
            response.message = 'user cannot unfollow themselves.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export { follow, unfollow }