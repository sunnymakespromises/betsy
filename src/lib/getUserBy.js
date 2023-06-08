import queryTable from './aws/db/queryTable'

async function getUserBy(column, value) {
    const response = {
        status: false,
        user: {
            follows: {
                followers: null,
                following: null,
            },
            slips: []
        },
        message: ''
    }
    const users = await queryTable('Users', { [column]: value })
    if (users.length > 0) {
        const user = users[0]
        response.status = true
        response.user = {
            ...users[0],
            follows: {
                followers: (await queryTable('Follows', { followee: user.id })),
                following: (await queryTable('Follows', { follower: user.id })),
            },
            slips: []
        }
    }
    else {
        response.message = 'no user found with that ' + column + '.'
    }

    return response
}

export { getUserBy }