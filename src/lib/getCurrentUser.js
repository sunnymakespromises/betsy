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
            response.user = betsyUser
        }
        else {
            const item = {
                'id': authUser.id,
                'username': authUser.name.replace(/[^A-Za-z0-9-_.]/g, '').substring(0, ),
                'email': authUser.email,
                'picture': authUser.picture
            }
            await insertItem('Users', item)
            response.status = true
            response.user = {
                ...item,
                follows: {
                    followers: (await queryTable('Follows', { followee: authUser.id })),
                    following: (await queryTable('Follows', { follower: authUser.id })),
                },
                slips: []
            }
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export default getCurrentUser