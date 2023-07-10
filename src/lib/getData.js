import getTable from './aws/db/getTable'
import now from './util/now'

async function getData(category = null, currentUser = null) {
    const response = {
        statuses: {},
        data: {},
        messages: {}
    }
    await fetchData(response)
    response.statuses.all = Object.keys(response.statuses).every(status => response.statuses[status] === true)
    return response

    async function fetchData(response) {
        let categories = category ? [category] : ['sports', 'competitions', 'events', 'competitors', 'users']
        const params = {
            sports: {
                table: 'Sports',
                attributes: ['id', 'name', 'picture'],
                sort: null
            },
            competitions: {
                table: 'Competitions',
                attributes: ['id', 'name', 'key', 'picture', 'sport', 'country', 'competitors', 'slip_count'],
                sort: (a) => a.sort((a, b) => (a.slip_count - b.slip_count))
            },
            events: {
                table: 'Events',
                attributes: ['id', 'name', 'competition', 'competitors', 'sport', 'is_outright', 'start_time', 'slip_count', 'odds'],
                sort: (a) => a.sort((a, b) => (a.start_time - b.start_time))
            },
            competitors: {
                table: 'Competitors',
                attributes: ['id', 'name', 'picture', 'competitions', 'sport', 'slip_count'],
                sort: (a) => a.sort((a, b) => (a.slip_count - b.slip_count))
            },
            users: {
                table: 'Users',
                attributes: ['id', 'picture', 'display_name', 'slips'],
                sort: null
            }
        }
        if (currentUser.is_dev) {
            params.logs = {
                table: 'Logs',
                attributes: null,
                sort: (a) => a.sort((a, b) => (b.timestamp - a.timestamp)).filter(a => a.timestamp > (now() - (60*60*24*7)))
            }
            if (!category) {
                categories.push('logs')
            }
        }
    
        let promises = []
        for (const category of categories) {
            if (params[category]) {
                promises.push(getTable(params[category].table, params[category].attributes))
            }
        }
    
        if (promises.length > 0) {
            await Promise.all(promises).then((values) => {
                for (const category of categories) {
                    const data = values[categories.indexOf(category)]
                    if (data.length > 0) {
                        response.data[category] = params[category].sort !== null ? params[category].sort(data) : data
                        response.statuses[category] = true
                    }
                    else {
                        response.messages[category] = 'no ' + category + ' found.'
                    }
                }
            })
        }

        if (!category || category === 'recommendations') {
            let events = response.events ? response.events : params.events.sort(await getTable(params.events.table, params.events.attributes))
            let users = response.users ? response.users : params.events.sort(await getTable(params.users.table, params.users.attributes))
            response.data.recommendations = getRecommendations(events, users)
        }
    }

    function getRecommendations(events, users) {
        let favoriteEvents = events.filter(event => event.competitors.some(competitor => currentUser.favorites.competitors.some(favorite => favorite.id === competitor.id)) || currentUser.favorites.competitions.some(favorite => favorite.id === event.competition.id)).sort((a, b) => a.start_time - b.start_time) // all of the events that have to do with the user's favorite
        let upcomingEvents = events.filter(event => event.start_time < (now() + (60*60*24*3))).sort((a, b) => a.start_time - b.start_time).slice(0, 24)
        let subscriptionSlips = users.filter(user => currentUser.subscriptions.includes(user.id)).sort((a, b) => b.timestamp - a.timestamp).slice(0, 24)
        return {
            favorites: favoriteEvents,
            upcoming: upcomingEvents,
            subscriptions: subscriptionSlips
        }

        // function getRecommendationScore(event) {
        //     const FAVORITE_WEIGHT = 0.35
        //     const TIME_WEIGHT = 0.65
        //     let time = scale(((now() - event.start_time) / (60*60*24)), [-3, 1], [0, 1]) * TIME_WEIGHT
        //     let favorite = favoriteEvents.includes(event) * FAVORITE_WEIGHT
        //     return event.is_outright ? -100 : favorite + time
        // }

        // function scale(number, [inMin, inMax], [outMin, outMax]) {
        //     return (number - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
        // }
    }
}

export { getData }