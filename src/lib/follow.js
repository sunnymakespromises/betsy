import authenticateUser from './authenticateUser'
import insertItem from './aws/db/insertItem'
import getItem from './aws/db/getItem'
import deleteItem from './aws/db/deleteItem'
import queryTable from './aws/db/queryTable'
import { v4 as uuidv4 } from 'uuid'

async function follow(refresh_token, id) {
    const response = {
        status: false,
        message: ''
    }
    if (refresh_token !== undefined) {
        await authenticateUser(refresh_token, async (user) => {
            if (user.id !== id) {
                const followTarget = await getItem('Users', id)
                if (followTarget) {
                    if ((await queryTable('Follows', { follower: user.id, followee: id })).length === 0) {
                        const item = {
                            id: uuidv4(),
                            follower: user.id,
                            followee: id
                        }
                        await insertItem('Follows', item)
                        response.status = true
                    }
                    else {
                        response.message = 'user already follows user with id ' + id + '.'
                    }
                }
                else {
                    response.message = 'user with id ' + id + ' does not exist.'
                }
            }
            else {
                response.message = 'user cannot follow themselves.'
            }
        })
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

async function unfollow(refresh_token, id) {
    const response = {
        status: false,
        message: ''
    }
    if (refresh_token !== undefined) {
        await authenticateUser(refresh_token, async (user) => {
            if (user.id !== id) {
                const followTarget = await getItem('Users', id)
                if (followTarget) {
                    const follow = (await queryTable('Follows', { follower: user.id, followee: id }))
                    if (follow.length > 0) {
                        await deleteItem('Follows', follow[0].id)
                        response.status = true
                    }
                    else {
                        response.message = 'user does not follow user with id ' + id + '.'
                    }
                }
                else {
                    response.message = 'user with id ' + id + ' does not exist.'
                }
            }
            else {
                response.message = 'user cannot unfollow themselves.'
            }
        })
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export { follow, unfollow }