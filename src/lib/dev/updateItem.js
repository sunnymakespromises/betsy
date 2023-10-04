import getItem from '../aws/db/getItem'
import { default as _updateItem } from '../aws/db/updateItem'
import insertFile from '../aws/s3/insertFile'

async function updateItem(item, category, value) {
    const response = {
        status: false,
        message: ''
    }
    if (value) {
        switch (category) {
            case 'picture':
                const fileName = item.sport.name + '/' + (item.category === 'competitions' ? item.key : item.category === 'competitors' ? item.name : 'error' ) + '.png'
                const file = new File([await fetch(value).then(async res => await res.blob())], fileName, { type: 'image/png' })
                let bucket = process.env.REACT_APP_AWS_PICTURES_BUCKET
                if (await insertFile(bucket, file)) {
                    let picture = 'https://' + bucket + '.s3.amazonaws.com/' + encodeURI(fileName)
                    await _updateItem(item.category, item.id, { picture: picture })
                    if (item.category === 'competitions') {
                        let competition = await getItem('competitions', item.id, ['id', 'name', 'sport', 'events', 'competitors'])
                        let competitions = (await getItem('sports', competition.sport.id, ['id', 'competitions'])).competitions.map(c => { return c.id === competition.id ? { id: c.id, name: c.name, picture: picture } : c })
                        await _updateItem('sports', competition.sport.id, { competitions: competitions })
                        for (const event of competition.events) {
                            await _updateItem('events', event.id, { competition: { id: competition.id, name: competition.name, picture: picture } })
                        }
                        for (const competitor of competition.competitors) {
                            let competitions = (await getItem('competitors', competitor.id, ['id', 'competitions'])).competitions.map(c => { return c.id === competition.id ?  { id: c.id, name: c.name, picture: picture } : c })
                            await _updateItem('competitors', competitor.id, { competitions: competitions })
                        }
                    }
                    else if (item.category === 'competitors') {
                        let competitor = await getItem('competitors', item.id, ['id', 'name', 'events', 'competitions'])
                        for (let competition of competitor.competitions) {
                            let competitors = (await getItem('competitions', competition.id, ['id', 'competitors'])).competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: c.name, picture: picture } : c })
                            await _updateItem('competitions', competition.id, { competitors: competitors })
                        }
                        for (let event of competitor.events) {
                            event = await getItem('events', event.id, ['id', 'competitors', 'bets'])
                            let competitors = event.competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: c.name, picture: picture } : c })
                            let bets = updateBets(event.bets, competitor.id, category, picture)
                            let results = Object.keys(event.results).length > 0 ? {
                                ...event.results,
                                scores: event.results.scores.map(score => { return {...score, competitor: (score.competitor && score.competitor.id === competitor.id) ? { id: score.competitor.id, name: score.competitor.name, picture: picture } : score.competitor}}),
                                bets: updateBets(event.results.bets, competitor.id, category, picture)
                            } : null
                            await _updateItem('events', event.id, { competitors: competitors, ...(bets ? {bets: bets} : {}), ...(results ? {results: results} : {}) })
                        }
                    }
                    response.status = true
                }
                else {
                    response.message = 'error uploading image.'
                }
                break
            case 'name':
                let name = value
                await _updateItem(item.category, item.id, { name: name })
                if (item.category === 'competitions') {
                    let competition = await getItem('competitions', item.id, ['id', 'name', 'sport', 'events', 'competitors'])
                    let competitions = (await getItem('sports', competition.sport.id, ['id', 'competitions'])).competitions.map(c => { return c.id === competition.id ? { id: c.id, name: name, picture: c.picture } : c })
                    await _updateItem('sports', competition.sport.id, { competitions: competitions })
                    for (const event of competition.events) {
                        await _updateItem('events', event.id, { competition: { id: competition.id, name: name, picture: competition.picture } })
                    }
                    for (const competitor of competition.competitors) {
                        let competitions = (await getItem('competitors', competitor.id, ['id', 'competitions'])).competitions.map(c => { return c.id === competition.id ?  { id: c.id, name: name, picture: c.picture } : c })
                        await _updateItem('competitors', competitor.id, { competitions: competitions })
                    }
                }
                else if (item.category === 'competitors') {
                    let competitor = await getItem('competitors', item.id, ['id', 'name', 'events', 'competitions'])
                    for (let competition of competitor.competitions) {
                        let competitors = (await getItem('competitions', competition.id, ['id', 'competitors'])).competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: name, picture: c.picture } : c })
                        await _updateItem('competitions', competition.id, { competitors: competitors })
                    }
                    for (let event of competitor.events) {
                        event = await getItem('events', event.id, ['id', 'competitors', 'bets'])
                        let competitors = event.competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: name, picture: c.picture } : c })
                        let bets = updateBets(event.bets, competitor.id, category, name)
                        let results = Object.keys(event.results).length > 0 ? {
                            ...event.results,
                            scores: event.results.scores.map(score => { return {...score, competitor: (score.competitor && score.competitor.id === competitor.id) ? { id: score.competitor.id, name: name, picture: score.competitor.picture } : score.competitor}}),
                            bets: updateBets(event.results.bets, competitor.id, category, name)
                        } : null
                        await _updateItem('events', event.id, { competitors: competitors, ...(bets ? {bets: bets} : {}), ...(results ? {results: results} : {}) })
                    }
                }
                response.status = true
                break
            default:
                break
        }
    }
    else {
        response.message = 'no ' + category + ' uploaded.'
    }

    return response
}

function updateBets(bets, id, category, newValue) {
    if (bets) {
        return bets?.map(bet => { return {
            ...bet,
            values: bet.values.map(value => { return {
                ...value,
                outcomes: value.outcomes.map(outcome => { return {
                    ...outcome,
                    ...( outcome?.competitor ? {competitor: outcome.competitor.id === id ? { ...outcome.competitor, [category]: newValue } : outcome.competitor } : {})
                }})
            }})
        }})
    }
    return null
}

export { updateItem }