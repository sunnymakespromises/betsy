/* eslint-disable no-loop-func */
/* eslint-disable no-unused-vars */
import insertItem from '../aws/db/insertItem'
import updateItem from '../aws/db/updateItem'
import getTable from '../aws/db/getTable'
import getItem from '../aws/db/getItem'
import deleteItem from '../aws/db/deleteItem'
import downloadJSON from '../util/downloadJSON'
import millisToMS from '../util/millisToMS'
import queryTable from '../aws/db/queryTable'
import countries from './countries'
const short = require('short-uuid')

const SPORTS_API_URL = 'https://api.the-odds-api.com/v4/sports/?apiKey=' + process.env.REACT_APP_ODDS_API_KEY + '&all=true'
const ALLOWED_SPORTS = ['American Football', 'Baseball', 'Basketball', 'Boxing', 'Golf', 'Ice Hockey', 'Soccer', 'Tennis']
const CHECK_IF_COMPLETED_OFFSETS = { 'American Football': 10800, 'Baseball': 7200, 'Basketball': 7200, 'Boxing': 900, 'Ice Hockey': 7200, 'Soccer': 5400 }
const PLAYER_PROPS = { 'basketball_nba': 'player_points,player_rebounds,player_assists,player_threes,player_double_double,player_blocks,player_steals,player_turnovers', 'American Football': 'player_pass_tds,player_pass_yds,player_pass_completions,player_pass_attempts,player_pass_interceptions,player_rush_yds,player_rush_attempts,player_receptions,player_reception_yds' }
const SOLO_SPORTS = ['Boxing', 'Golf', 'Tennis']
const MARKET_NAMES = { h2h: 'Moneyline', spreads: 'Points Spread', totals: 'Total Score', outrights: 'Outright Winner', alternate_spreads: 'Alternate Spreads', alternate_totals: 'Alternate Totals', draw_no_bet: 'Draw No Bet', player_pass_tds: 'Passing Touchdowns', player_pass_yds: 'Passing Yards', player_pass_completions: 'Pass Completions', player_pass_attempts: 'Pass Attempts', player_pass_interceptions: 'Interceptions', player_rush_yds: 'Rushing Yards', player_rush_attempts: 'Rush Attempts', player_receptions: 'Receptions', player_reception_yds: 'Reception Yards', player_points: 'Points', player_rebounds: 'Rebounds', player_assists: 'Assists', player_threes: 'Threes', player_double_double: 'Double Double?', player_blocks: 'Blocks', player_steals: 'Steals', player_turnovers: 'Turnovers' }
const LAZY = true

async function initializeApiData() {
    const response = {
        status: false,
        message: ''
    }
    let log = {
        sports: {
            reads: 0,
            writes: 0,
            requests: 0,
            time: '0m0s',
            changes: []
        },
        competitions: {
            reads: 0,
            writes: 0,
            requests: 0,
            time: '0m0s',
            changes: []
        },
        competitors: {
            reads: 0,
            writes: 0,
            requests: 0,
            time: '0m0s',
            changes: []
        },
        events: {
            reads: 0,
            writes: 0,
            requests: 0,
            time: '0m0s',
            changes: []
        },
        eventSweeps: {
            reads: 0,
            writes: 0,
            requests: 0,
            time: '0m0s',
            changes: []
        },
        totals: {
            reads: 0,
            writes: 0,
            requests: 0,
            time: '0m0s'
        }
    }
    const startTime = Date.now()
    console.log('started..')
    await updateSports(log)
    console.log('done with sports in ', log.sports.time + '.')
    await updateCompetitions(log)
    console.log('done with competitions in ', log.competitions.time + '.')
    await updateCompetitors(log)
    console.log('done with competitors in ', log.competitors.time + '.')
    await updateEvents(log)
    await sweepEvents(log)
    log.totals.time = millisToMS(Date.now() - startTime)
    console.log('done at', Date.now(), 'in', ((Date.now() - startTime) / 1000), 's.' )
    // downloadJSON(log, 'log_' + Date.now() + '.json')

    return response
}

// every month on the 1st of the month @ 12:00
async function updateSports(log) {
    let usage = { reads: 0, writes: 0, requests: 0, time: Date.now() }
    let url = SPORTS_API_URL
    let options = { method: 'GET' }
    await fetch(url, options)
    .then(async (res) => {
        if (res.status === 200) {
            res = await res.json()
            const sports = res.map(i => i.group).filter((v, i, s) => s.indexOf(v) === i).filter(s => ALLOWED_SPORTS.includes(s)) // get unique sports from the api response
            for (const sport of sports) { // for each sport
                const sportInDb = await queryTable('Sports', 'name = /' + sport + '/', ['id'], true);usage.reads++ // get the existing sport in the db
                if (!sportInDb) { // if sport is not already in the db
                    const item = { // create sport object
                        id: short.generate(),
                        name: sport,
                        competitions: [],
                        is_solo: SOLO_SPORTS.includes(sport),
                        slip_count: 0
                    }
                    await insertItem('Sports', item);usage.writes++ // insert sport into the db
                    log.sports.changes.push('+ ' + item.name)
                }
            }
        }
    })
    addUsage(log.totals, log.sports, usage)
}

// every 3 days @ 12:01am
async function updateCompetitions(log) {
    let usage = { reads: 0, writes: 0, requests: 0, time: Date.now() }
    let url = SPORTS_API_URL
    let options = { method: 'GET' }
    await fetch(url, options)
    .then(async (res) => {
        if (res.status === 200) {
            res = await res.json()
            const competitions = res.filter(i => ALLOWED_SPORTS.includes(i.group)).filter((v, i, s) => s.indexOf(v) === i) // get unique competitions from the api response
            for (const competition of competitions) { // for each competition
                const competitionInDb = await queryTable('Competitions', 'key = ' + competition.key, ['id', 'name', 'is_active'], true);usage.reads++ // get the existing competition in the db
                if (!competitionInDb) { // if the competition is not already in the db
                    const sport = await queryTable('Sports', 'name = /' + competition.group + '/', ['id', 'name', 'is_solo', 'competitions'], true);usage.reads++ // get the sport from the db that this competition belongs to
                    const item = { // create the competition object
                        id: short.generate(),
                        key: competition.key,
                        name: competition.title === 'EPL' ? 'Premier League' : competition.title.replace(' Winner', '').split(' - ')[0],
                        sport: {
                            id: sport.id,
                            name: sport.name
                        },
                        competitors: [],
                        country: Object.keys(countries).find(c => countries[c].includes(competition.key)),
                        events: [],
                        slip_count: 0,
                        is_solo: sport.is_solo,
                        is_active: competition.active,
                        is_outright: competition.has_outrights
                    }
                    await insertItem('Competitions', item);usage.writes++ // insert competition into the db
                    log.competitions.changes.push('+ ' + item.name)
                    await updateItem('Sports', sport.id, { competitions: [...sport.competitions, { id: item.id, name: item.name }]});usage.writes++ // update the sport's competitions in the db to include this one
                    log.competitions.changes.push('+ ' + item.name + ' to ' + sport.name + `'s competitions`)
                }
                else if (competitionInDb.is_active !== competition.active){ // if the competition has changed its active status since the last time
                    await updateItem('Competitions', competitionInDb.id, { active: competition.active });usage.writes++ // update the competition's active status accordingly
                    log.competitions.changes.push('~ ' + competitionInDb.name + ' is now ' + (competition.active ? 'active' : 'inactive'))
                }
            }
        }
    })
    addUsage(log.totals, log.competitions, usage)
}

// every 3 days @ 12:02am
async function updateCompetitors(log) {
    let usage = { reads: 0, writes: 0, requests: 0, time: Date.now() }
    let events = await getEvents(usage, false, null)
    let changeWasMade = false
    for (let eventGroup of events) { // for each competitions' events
        let competition = await queryTable('Competitions', 'key = ' + eventGroup[0].sport_key, ['id', 'name', 'sport', 'competitors'], true);usage.reads++ // get the corresponding competition from the db
        for (const event of eventGroup) { // for each event
            let competitors = event.has_outrights ? event.bookmakers.find(b => b.key === 'fanduel')?.markets?.find(m => m.key === 'outrights')?.outcomes?.map(o => o.name)?.filter((v, i, s) => s.indexOf(v) === i) : [event.home_team, event.away_team] // for outright events, its getting all of the possible outcomes of the outright bet. if not, its just the home and away team LOL
            for (const competitor of competitors) { // for each competitor in the event
                if (changeWasMade) { competition = await getItem('Competitions', competition.id, ['id', 'name', 'sport', 'competitors']);usage.reads++ } // if a change was made in the last loop, refresh the competition. let's say we add competitor A to a competition as a competitor and sets competition.competitors to [A.id]. then we add competitor B to the same competition. if we didnt refresh the competition, the second loop will access competition.competitors as [], and will set it to [B.id]. now, it can see that competition.competitors was set to [A.id] and will now set it to [A.id, B.id]
                const competitorInDb = await queryTable('Competitors', 'name = /' + competitor + '/ and sport.id = ' + competition.sport.id, ['id', 'name', 'competitions'], true);usage.reads++ // get the competitor in the db
                if (competitorInDb) { // if the competitor is already in the db
                    if (!(competitorInDb.competitions.some(c => c.id === competition.id))) { // if this competition is "new" for the competitor
                        await updateItem('Competitors', competitorInDb.id, { competitions: [...competitorInDb.competitions, { id: competition.id, name: competition.name }]});usage.writes++ // update competitor to include this competition 
                        log.competitors.changes.push('+ ' + competition.name + ' to ' + competitorInDb.name + `'s competitions`)
                        await updateItem('Competitions', competition.id, { competitors: [...competition.competitors, { id: competitorInDb.id, name: competitorInDb.name }]});usage.writes++ // update competition to include this competitor
                        log.competitors.changes.push('+ ' + competitorInDb.name + ' to ' + competition.name + `'s competitors`)
                        changeWasMade = true // change was made
                    }
                    else { changeWasMade = false } // if this competition was already seen by the competitor, no change was made
                }
                else { // if the competitor is not already in the db
                    const item = { // create the competitor object
                        id: short.generate(),
                        name: competitor,
                        sport: competition.sport,
                        competitions: [{
                            id: competition.id,
                            name: competition.name
                        }],
                        events: [],
                        slip_count: 0
                    }
                    await insertItem('Competitors', item);usage.writes++ // insert competitor into the db
                    log.competitors.changes.push('+ ' + item.name)
                    await updateItem('Competitions', competition.id, { competitors: [...competition.competitors, { id: item.id, name: item.name }]});usage.writes++ // update competition to include this competitor
                    log.competitors.changes.push('+ ' + item.name + ' to ' + competition.name + `'s competitors`)
                    changeWasMade = true // change was made
                }
            }
        }
    }
    addUsage(log.totals, log.competitors, usage)
}

// every day @ 12:10
async function updateEvents(log) {
    let usage = { reads: 0, writes: 0, requests: 0, time: Date.now() }
    let events = await getEvents(usage, true, null)
    let allCompetitors = await getTable('Competitors', ['id', 'name']);usage.reads++
    let changeWasMade = false
    for (const eventGroup of events) { // for each competitions' events
        let competition = await queryTable('Competitions', 'key = ' + eventGroup[0].sport_key, null, true);usage.reads++ // get the corresponding competition from the db
        for (const event of eventGroup) { // for every event
            if (changeWasMade) { competition = await queryTable('Competitions', 'key = ' + eventGroup[0].sport_key, null, true);usage.reads++ }// if a change was made in the last loop, refresh the competition. let's say we add event A to a competition and sets competition.events to [A.id]. then we add event B to the same competition. if we didnt refresh the competition, the second loop will access competition.events as [], and will set it to [B.id]. now, it can see that competition.events was set to [A.id] and will now set it to [A.id, B.id]
            let eventInDb = await getItem('Events', event.id, ['id']);usage.reads++ // get the event in the db
            if (!eventInDb) { // if the event is not already in the db
                let competitors = (event.has_outrights ? event.bookmakers.find(b => b.key === 'fanduel')?.markets?.find(m => m.key === 'outrights')?.outcomes?.map(o => o.name)?.filter((v, i, s) => s.indexOf(v) === i) : [event.home_team, event.away_team])?.map(c => { return { id: (allCompetitors.find(c2 => c2.name === c))?.id, name: (allCompetitors.find(c2 => c2.name === c))?.name}}) // for outright events, its getting all of the possible outcomes of the outright bet. if not, its just the home and away team LOL. then replace the names with the proper ids/names.
                const item = { // create the event object
                    id: event.id,
                    start_time: event.commence_time,
                    name: event.has_outrights ? competition.name : competition.is_solo ? event.home_team + ' v ' + event.away_team : event.away_team + ' @ ' + event.home_team,
                    sport: competition.sport,
                    competition: {
                        id: competition.id,
                        name: competition.name
                    },
                    competitors: competitors ? competitors : [],
                    last_updated: null,
                    next_update: null,
                    odds: event.bookmakers.find(b => b.key === 'fanduel')?.markets.map(m => { return { key: m.key, name: MARKET_NAMES[m.key], outcomes: m.outcomes.map(o => { return { [(competitors.find(c => c.name === o.name) ? 'competitor' : 'name')]: (competitors.find(c => c.name === o.name) ? competitors.find(c => c.name === o.name) : o.name), [o.description ? 'competitor' : null]: (o.description ? competitors.find(c => c.name === o.description) : null), odds: o.price, point: (o.point ? o.point : null) } })} }), // looks scary but it just condenses the odds into the right form
                    slip_count: 0,
                    is_outright: competition.is_outright,
                    is_solo: competition.is_solo,
                    is_completed: false
                }
                await insertItem('Events', item);usage.writes++ // insert event into the db
                log.events.changes.push('+ ' + item.name)
                await updateItem('Competitions', competition.id, { events: [...competition.events, { id: item.id, name: item.name }]});usage.writes++ // update the competition's events to include this event
                log.events.changes.push('+ ' + item.name + ' to ' + competition.name + `'s events`)
                for (let competitor of competitors) { // for each competitor in the competition
                    competitor = await getItem('Competitors', competitor.id, ['id', 'name', 'events']);usage.reads++ // get the competitor in the db
                    await updateItem('Competitors', competitor.id, { events: [...competitor.events, { id: item.id, name: item.name }]});usage.writes++ // update the competitor's events to include this event
                    log.events.changes.push('+ ' + item.name + ' to ' + competitor.name + `'s events`)
                }
                changeWasMade = true // change was made
            }
            else { changeWasMade = false } // no change was made
        }
    }
    const eventsInDb = await getTable('Events', ['id', 'is_completed', 'competitors', 'competition']);usage.reads++ // get events in db
    for (const event in eventsInDb) { // for every event
        if (event.is_completed) { // if the event is completed
            for (let competitor of event.competitors) { // for each competitor in the event
                competitor = await getItem('Competitors', competitor.id, ['id', 'events']);usage.reads++ // get the competitor in the db
                await updateItem('Competitors', competitor.id, { events: competitor.events.filter(e => e.id !== event.id) });usage.writes++ // remove the event from the competitor's events
                log.events.changes.push('- ' + event.name + ' from ' + competitor.name + `'s events`)
            }
            let competition = await getItem('Competitions', event.competition.id, ['id', 'events']);usage.reads++ // get the competition in the db
            await updateItem('Competitions', competition.id, { events: competition.events.filter(e => e.id !== event.id) });usage.writes++ // remove the event from the competition's events
            log.events.changes.push('- ' + event.name + ' from ' + competition.name + `'s events`)
            await deleteItem('Events', event.id);usage.writes++ // delete the event from the db
            log.events.changes.push('- ' + event.name)
        }
    }
    addUsage(log.totals, log.events, usage)
}

// every 10 minutes 
async function updateOdds(log) {

}

// every 10 minutes
async function sweepEvents(log) {
    let usage = { reads: 0, writes: 0, requests: 0, time: Date.now() }
    let competitions = await queryTable('Competitions', 'is_active = true', null, false);usage.reads++
    for (const competition of competitions) {
        let events = await queryTable('Events', 'sport.id = ' + competition.sport.id + ' and start_time < ' + (Date.now() - CHECK_IF_COMPLETED_OFFSETS[competition.sport.name]), null, false)
    }
    addUsage(log.totals, log.eventSweeps, usage)
}

async function getEvents(usage, allMarkets, specificCompetitions = null) {
    let url = LAZY ? 'res/events.json' : ''
    let options = LAZY ? { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } } : { method: 'GET' }
    let events = []
    if (LAZY) {
        await fetch(url, options).then((res) => res.json()).then((data) => { events = data })
    }
    else {
        let competitions = specificCompetitions ? specificCompetitions : (await getTable('Competitions')).filter(c => c.is_active);usage.reads++ // get active competitions
        let oldReqs, newReqs, reqSize // initializes three variables for counting how many requests i used
        for (const competition of competitions) { // for each competition
            url = 'https://api.the-odds-api.com/v4/sports/' + competition.key + '/odds?apiKey=' + process.env.REACT_APP_ODDS_API_KEY + '&regions=us&markets=' + (competition.is_outright ? 'outrights' : allMarkets ? 'h2h,spreads' : 'h2h') + '&bookmakers=fanduel&oddsFormat=american&dateFormat=unix'
            await fetch(url, options)
            .then(async (res) => {
                newReqs = res.headers.get('x-requests-used') // get the current # of requests used
                if (oldReqs) { reqSize = (newReqs - oldReqs); usage.requests += reqSize } // if we have access to the previous number of requests used (basically every time but the first iteration), set reqSize to the difference and add it to requests
                oldReqs = newReqs // sets oldReqs to newReqs
                if (res.status === 200) {
                    res = await res.json()
                    if (res.length > 0) { // if the competition actually has events in it
                        events.push(res) // push event to events
                    }
                }
            })
        }
        usage.requests += reqSize // adds another reqSize for the first loop, because it doesn't get counted on the first time as we don't know the previous number of requests used.
        downloadJSON(events, 'events.json') // download events as json to cache for later (testing only)
    }
    return events
}

function addUsage(totals, inner, usage) {
    inner.reads = usage.reads
    inner.writes = usage.writes
    inner.requests = usage.requests
    inner.time = millisToMS(Date.now() - usage.time)
    totals.reads += usage.reads
    totals.writes += usage.writes
    totals.requests += usage.requests
}

export { initializeApiData }