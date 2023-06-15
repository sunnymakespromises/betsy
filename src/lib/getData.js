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

    const sports = await getTable('Sports')
    if (sports.length > 0) {
        for (const sport of sports) {
            response.data.sports.push({
                id: sport.id,
                name: sport.name,
            })
        }
        response.statuses.sports = true
    }
    else {
        response.messages.sports = 'no sports found.'
    }

    const competitions = await getTable('Competitions')
    if (competitions.length > 0) {
        for (const competition of competitions) {
            response.data.competitions.push({
                id: competition.id,
                name: competition.name,
            })
        }
        response.statuses.competitions = true
    }
    else {
        response.messages.competitions = 'no competitions found.'
    }

    const events = await getTable('Events')
    if (events.length > 0) {
        for (const event of events) {
            response.data.events.push({
                id: event.id,
                name: event.name,
            })
        }
        response.statuses.events = true
    }
    else {
        response.messages.events = 'no events found.'
    }

    const competitors = await getTable('Competitors')
    if (competitors.length > 0) { 
        for (const competitor of competitors) {
            response.data.competitors.push({
                id: competitor.id,
                name: competitor.name
            })
        }
        response.statuses.competitors = true
    }
    else {
        response.messages.competitors = 'no competitors found.'
    }

    const users = await getTable('Users')
    if (users.length > 0) {
        for (const user of users) {
            response.data.users.push({
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                picture: user.picture
            })
        }
        response.statuses.users = true
    }
    else {
        response.messages.users = 'no users found.'
    }

    response.statuses.all = Object.keys(response.statuses).every(status => response.statuses[status] === true)

    return response
}

export { getData }