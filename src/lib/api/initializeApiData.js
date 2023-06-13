import insertItem from '../aws/db/insertItem'
import updateItem from '../aws/db/updateItem'
import queryTable from '../aws/db/queryTable'
import getTable from '../aws/db/getTable'
const short = require('short-uuid')
const ALLOWED_SPORTS = ['American Football', 'Baseball', 'Basketball', 'Boxing', 'Golf', 'Ice Hockey', 'Soccer', 'Tennis']
const SOLO_SPORTS = ['pD2CvR8vTinGoFcgTbgTPD', 'nHk8V3ZDLchUXmsf3p85U9', '2RmdT7TWr5LZFbob3vaw2X'] // [Boxing, Golf, Tennis]

async function initializeApiData(oddsFormat) {
    const response = {
        status: false,
        message: ''
    }
    let url = 'https://api.the-odds-api.com/v4/sports/?apiKey=' + process.env.REACT_APP_ODDS_API_KEY + '&all=true'
    await fetch(url, { method: 'GET' })
    .then(async (sportsResponse) => {
        if (sportsResponse.status === 200) {
            sportsResponse = await sportsResponse.json()
            const sports = await uploadSports(sportsResponse)
            const competitions = await uploadCompetitions(sportsResponse, sports)
            const events = await getEvents(competitions, oddsFormat, true)
            const competitors = await uploadCompetitors(events)
            console.log(sports, competitions, events, competitors)
        }
    })

    return response
}

async function uploadSports(apiResponse) {
    const sportsTable = await getTable('Sports')
    const sports = apiResponse.map(item => item.group).filter((value, index, self) => self.indexOf(value) === index).filter(sport => ALLOWED_SPORTS.includes(sport))
    const sportObjects = []
    for (const sport of sports) {
        if (sportsTable.filter(s => s.title === sport).length === 0) {
            const item = {
                id: short.generate(),
                title: sport,
                competitions: [],
            }
            sportObjects.push(item)
            await insertItem('Sports', item)
        }
        else {
            sportObjects.push(sportsTable.filter(s => s.title === sport)[0])
        }
    }
    return sportObjects
}

async function uploadCompetitions(apiResponse, sports) {
    const competitionsTable = await getTable('Competitions')
    const competitions = apiResponse.filter(item => ALLOWED_SPORTS.includes(item.group))
    const competitionObjects = []
    for (const competition of competitions) {
        if (competitionsTable.filter(c => c.key === competition.key).length === 0) {
            const sport = (await queryTable('Sports', { title: competition.group }))[0]
            const item = {
                id: short.generate(),
                key: competition.key,
                title: competition.title,
                sport: sport.id,
                isSoloSport: SOLO_SPORTS.includes(sport.id),
                active: competition.active,
                outright: competition.has_outrights,
                competitors: [],
                events: []
            }
            competitionObjects.push(item)
            await insertItem('Competitions', item)
            await updateItem('Sports', sport.id,{ competitions: [...sport.competitions, item.id]})
        }
        else {
            competitionObjects.push(competitionsTable.filter(c => c.key === competition.key)[0])
        }
    }
    return competitionObjects
}

async function getEvents(competitions, oddsFormat, lazy = false) {
    if (lazy) {
        return await fetch('res/events.json', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })
        .then((res) => res.json())
        .then((data) => {return data})
    }
    else {
        competitions = competitions.filter(competition => competition.active)
        const eventObjects = []
        for (const competition of competitions) {
            let url = 'https://api.the-odds-api.com/v4/sports/' + competition.key + '/odds?apiKey=' + process.env.REACT_APP_ODDS_API_KEY + '&regions=us&markets=h2h,spreads,totals' + (competition.outright ? ',outrights' : '') + '&oddsFormat=' + oddsFormat.toLowerCase() + '&bookmakers=fanduel'
            await fetch(url, { method: 'GET' })
            .then(async (competitionResponse) => {
                if (competitionResponse.status === 200) {
                    competitionResponse = await competitionResponse.json()
                    eventObjects.push(competitionResponse)
                }
            })
        }
        const element = document.createElement('a')
        const textFile = new Blob([JSON.stringify(eventObjects)], {type: 'text/plain'})
        element.href = URL.createObjectURL(textFile)
        element.download = 'events.json'
        document.body.appendChild(element)
        element.click()
        return eventObjects
    }
}

async function uploadCompetitors(events) {
    const oldCompetitors = await getTable('Competitors')
    const newCompetitors = []
    for (let competitionEvents of events) {
        const competition = (await queryTable('Competitions', { key: competitionEvents[0].sport_key }))[0]
        const sport = competition.sport
        for (const event of competitionEvents) {
            let competitors = event.has_outrights ? event.bookmakers.filter(b => b.key === 'fanduel')[0].markets.filter(m => m.key === 'outrights')[0].outcomes.map(outcome => outcome.name).filter((value, index, self) => self.indexOf(value) === index) : [event.home_team, event.away_team]
            for (const competitor of competitors) { // FOR EACH COMPETITOR IN THE EVENT
                const oldVersion = oldCompetitors.filter(t => t.title === competitor).length !== 0 ? oldCompetitors.filter(t => t.title === competitor)[0] : null // GET THE OLD VERSION OF IT (IN THE TABLE)
                const newVersion = newCompetitors.filter(t => t.title === competitor).length !== 0 ? newCompetitors.filter(t => t.title === competitor)[0] : null // AND THE NEW VERSION (IN THE ARRAY)
                if (oldVersion) { // IF THE TABLE ALREADY HAD THIS COMPETITOR
                    if (oldVersion.competitions.includes(competition.id)) { // IF THIS COMPETITION ISNT A NEW COMPETITION FOR THE COMPETITOR
                        newCompetitors.push(oldVersion) // JUST PUSH THE OLD VERSION TO THE ARRAY
                    }
                    else { // IF THIS COMPETITION WAS NOT SEEN BEFORE BY THE OLD VERSION
                        const item = {
                            ...oldVersion,
                            competitions: [...oldVersion.competitions, competition.id]
                        }
                        newCompetitors.push(item)
                        await updateItem('Competitors', oldVersion.id, { competitions: [...oldVersion.competitions, competition.id]})
                        await updateItem('Competitions', competition.id, { competitors: [...competition.competitors, item.id]})
                    }
                }
                else { // IF THE TABLE DID NOT ALREADY HAVE THIS COMPETITOR
                    if (newVersion) { // IF NEWCOMPETITOR ALREADY HAS THIS COMPETITOR
                        if (newVersion.competitions.includes(competition.id)) { // IF THIS COMPETITION IS ALREADY PLAYED BY THE COMPETITOR
                            // DO NOTHING
                        }
                        else { // IF THIS COMPETITION WAS NOT PLAYED IN BEFORE
                            const item = {
                                ...newVersion,
                                competitions: [...newVersion.competitions, competition.id]
                            }
                            newCompetitors[newCompetitors.map(t => t.id).indexOf(newVersion.id)] = item
                            await updateItem('Competitors', newVersion.id, { competitions: [...newVersion.competitions, competition.id]})
                            await updateItem('Competitions', competition.id, { competitors: [...competition.competitors, item.id]})
                        }
                    }
                    else { // IF NEWCOMPETITOR DOES NOT HAVE THIS COMPETITOR
                        const item = {
                            id: short.generate(),
                            title: competitor,
                            sport: sport,
                            competitions: [competition.id],
                            players: []
                        }
                        newCompetitors.push(item)
                        await insertItem('Competitors', item)
                        await updateItem('Competitions', competition.id, { competitors: [...competition.competitors, item.id]})
                    }
                }
            }
        }
    }
    return newCompetitors
}


export { initializeApiData }