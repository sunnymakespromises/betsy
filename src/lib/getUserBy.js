import queryTable from './aws/db/queryTable'

async function getUserBy(column, value) {
    const response = {
        status: false,
        user: {
            subscriptions: {
                subscribers: null,
                subscriptions: null,
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
            subscriptions: {
                subscribers: (await queryTable('Subscriptions', { subscribee: user.id })),
                subscriptions: (await queryTable('Subscriptions', { subscriber: user.id })),
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