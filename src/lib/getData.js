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
                attributes: ['id', 'name', 'picture', 'sport', 'country', 'competitors', 'slip_count'],
                sort: (a) => a.sort((a, b) => (a.slip_count - b.slip_count))
            },
            events: {
                table: 'Events',
                attributes: ['id', 'name', 'competition', 'competitors', 'sport', 'is_outright', 'start_time', 'slip_count'],
                sort: (a) => a.sort((a, b) => (a.start_time - b.start_time))
            },
            competitors: {
                table: 'Competitors',
                attributes: ['id', 'name', 'picture', 'competitions', 'sport', 'slip_count'],
                sort: (a) => a.sort((a, b) => (a.slip_count - b.slip_count))
            },
            users: {
                table: 'Users',
                attributes: ['id', 'username', 'picture', 'display_name'],
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
            promises.push(getTable(params[category].table, params[category].attributes))
        }
    
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

        if (!category) {
            response.data.recommendations = getRecommendations()
        }
    }

    function getRecommendations() {
        let favoriteEvents = response.data.events.filter(e => e.competitors?.some(c => currentUser.favorites.competitors?.some(fc => fc.id === c.id)) || e.competitions?.some(c => currentUser.favorites.competitions?.some(fc => fc.id === c.id))) // all of the events that have to do with the user's favorite
        let upcomingEvents = response.data.events.filter(e => e.start_time < (now() + (60*60*24*3))) 
        let upcomingRecommendations = upcomingEvents.sort((a, b) => getRecommendationScore(b) - getRecommendationScore(a))
        let liveRecommendations = upcomingRecommendations.filter(r => r.start_time < now()).slice(0, 20).map(r => { return {...r, category: 'events', group: 'live'} })
        upcomingRecommendations = upcomingEvents.filter(r => r.start_time > now()).slice(0, 40 - liveRecommendations.length).map(r => { return {...r, category: 'events', group: 'upcoming'} })
        return {
            events: liveRecommendations.concat(upcomingRecommendations)
        }

        function getRecommendationScore(event) {
            const FAVORITE_WEIGHT = 0.4
            const TIME_WEIGHT = 0.6
            return event.is_outright ? -100 : (favoriteEvents.includes(event) * FAVORITE_WEIGHT) + (((now() - event.start_time) / (60*60*24)) * TIME_WEIGHT)
        }
    }
}

export { getData }