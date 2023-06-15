import getTable from './aws/db/getTable'

async function getData() {
    const response = {
        statuses: {
            all: false,
            sports: false,
            competitions: false,
            events: false,
            competitors: false,
            users: false
        },
        data: {
            Sports: [],
            Competitions: [],
            Events: [],
            Competitors: [],
            Users: []
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
        response.data.Sports = sports
        response.statuses.sports = true
    }
    else {
        response.messages.sports = 'no sports found.'
    }

    const competitions = await getTable('Competitions')
    if (competitions.length > 0) {
        response.data.Competitions = competitions
        response.statuses.competitions = true
    }
    else {
        response.messages.competitions = 'no competitions found.'
    }

    const events = await getTable('Events')
    if (events.length > 0) {
        response.data.Events = events
        response.statuses.events = true
    }
    else {
        response.messages.events = 'no events found.'
    }

    const competitors = await getTable('Competitors')
    if (competitors.length > 0) { 
        response.data.Competitors = competitors
        response.statuses.competitors = true
    }
    else {
        response.messages.competitors = 'no compeitors found.'
    }

    const users = await getTable('Users')
    if (users.length > 0) {
        response.data.Users = []
        for (const user of users) {
            delete user['auth_id']
            delete user['auth_source']
            response.data.Users.push(user)
        }
        response.statuses.users = true
    }
    else {
        response.messages.users = 'no users found.'
    }

    if (response.statuses.sports && response.statuses.competitions && response.statuses.events && response.statuses.competitors && response.statuses.users) {
        response.statuses.all = true
    }

    return response
}

export { getData }