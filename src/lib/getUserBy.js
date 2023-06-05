import queryTable from './aws/db/queryTable'

async function getUserBy(key, value) {
    const response = {
        status: false,
        data: {
            user: null,
            follows: {
                followers: null,
                following: null
            },
            slips: [],
        },
        message: ''
    }
    const users = await queryTable('Users', { [key]: value })
    if (users.length > 0) {
        const user = users[0]
        const followers = (await queryTable('Follows', { followee: user.id }))
        const following = (await queryTable('Follows', { follower: user.id }))
        response.status = true
        response.data = {
            user: users[0],
            follows: {
                followers: followers,
                following: following,
            },
            slips: []
        }
    }
    else {
        response.message = 'no user found with that ' + key + '.'
    }

    return response
}

export { getUserBy }