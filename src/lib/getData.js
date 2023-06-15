import getTable from './aws/db/getTable'

async function getData() {
    const response = {
        statuses: {
            sports: false,
            competitions: false,
            events: false,
            competitors: false,
            users: false
        },
        data: {
            sports: [],
            competitions: [],
            events: [],
            competitors: [],
            users: []
        },
        messages: {
            sports: '',
            competitions: '',
            events: '',
            competitors: '',
            users: ''
        }
    }

    const sports = await getTable('Sports', ['id', 'name'])
    if (sports.length > 0) {
        response.data.sports = sports
        response.statuses.sports = true
    }
    else {
        response.messages.sports = 'no sports found.'
    }

    const competitions = await getTable('Competitions', ['id', 'name'])
    if (competitions.length > 0) {
        response.data.competitions = competitions
        response.statuses.competitions = true
    }
    else {
        response.messages.competitions = 'no competitions found.'
    }

    const events = await getTable('Events', ['id', 'name'])
    if (events.length > 0) {
        response.data.events = events
        response.statuses.events = true
    }
    else {
        response.messages.events = 'no events found.'
    }

    const competitors = await getTable('Competitors', ['id', 'name'])
    if (competitors.length > 0) { 
        response.data.competitors = competitors
        response.statuses.competitors = true
    }
    else {
        response.messages.competitors = 'no competitors found.'
    }

    const users = await getTable('Users', ['id', 'username', 'display_name', 'picture'])
    if (users.length > 0) {
        response.data.users = users
        response.statuses.users = true
    }
    else {
        response.messages.users = 'no users found.'
    }

    response.statuses.all = Object.keys(response.statuses).every(status => response.statuses[status] === true)

    return response
}

export { getData }