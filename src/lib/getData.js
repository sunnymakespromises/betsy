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

    const competitions = await getTable('Competitions', ['id', 'name', 'picture', 'sport', 'country', 'competitors', 'slip_count'])
    if (competitions.length > 0) {
        response.data.competitions = competitions.sort((a, b) => (a.slip_count - b.slip_count))
        response.statuses.competitions = true
    }
    else {
        response.messages.competitions = 'no competitions found.'
    }

    const events = await getTable('Events', ['id', 'name', 'competition', 'competitors', 'sport', 'is_outright', 'start_time', 'slip_count'])
    if (events.length > 0) {
        response.data.events = events.sort((a, b) => (a.start_time - b.start_time) || (a.slip_count - b.slip_count))
        response.statuses.events = true
    }
    else {
        response.messages.events = 'no events found.'
    }

    const competitors = await getTable('Competitors', ['id', 'name', 'picture', 'competitions', 'sport', 'slip_count'])
    if (competitors.length > 0) { 
        response.data.competitors = competitors.sort((a, b) => (a.slip_count - b.slip_count))
        response.statuses.competitors = true
    }
    else {
        response.messages.competitors = 'no competitors found.'
    }

    const users = await getTable('Users', ['id', 'username', 'picture', 'display_name'])
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