import _ from 'lodash'
import getItem from '../aws/db/getItem'
import updateItem from '../aws/db/updateItem'
import insertFile from '../aws/s3/insertFile'

async function uploadPicture(item, value) {
    const response = {
        status: false,
        message: ''
    }
    if (value) {
        const fileName = item.sport.name + '/' + (item.category === 'competitions' ? item.key : item.category === 'competitors' ? item.name : 'error' ) + '.png'
        const file = new File([await fetch(value).then(async res => await res.blob())], fileName, { type: 'image/png' })
        let bucket = process.env.REACT_APP_AWS_PICTURES_BUCKET
        if (await insertFile(bucket, file)) {
            let picture = 'https://' + bucket + '.s3.amazonaws.com/' + encodeURI(fileName)
            await updateItem(_.startCase(item.category), item.id, { picture: picture })
            if (item.category === 'competitions') {
                let competition = await getItem('Competitions', item.id, ['id', 'name', 'sport', 'events', 'competitors'])
                let competitions = (await getItem('Sports', competition.sport.id, ['id', 'competitions'])).competitions.map(c => { return c.id === competition.id ? { id: c.id, name: c.name, picture: picture } : c })
                await updateItem('Sports', competition.sport.id, { competitions: competitions })
                for (const event of competition.events) {
                    await updateItem('Events', event.id, { competition: { id: competition.id, name: competition.name, picture: picture } })
                }
                for (const competitor of competition.competitors) {
                    let competitions = (await getItem('Competitors', competitor.id, ['id', 'competitions'])).competitions.map(c => { return c.id === competition.id ?  { id: c.id, name: c.name, picture: picture } : c })
                    await updateItem('Competitors', competitor.id, { competitions: competitions })
                }
            }
            else if (item.category === 'competitors') {
                let competitor = await getItem('Competitors', item.id, ['id', 'name', 'events', 'competitions'])
                for (let competition of competitor.competitions) {
                    let competitors = (await getItem('Competitions', competition.id, ['id', 'competitors'])).competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: c.name, picture: picture } : c })
                    await updateItem('Competitions', competition.id, { competitors: competitors })
                }
                for (let event of competitor.events) {
                    event = await getItem('Events', event.id, ['id', 'competitors', 'bets'])
                    let competitors = event.competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: c.name, picture: picture } : c })
                    let bets  = event.bets?.map(bet => { return {
                        ...bet,
                        values: bet.values.map(value => { return {
                            ...value,
                            outcomes: value.outcomes.map(outcome => { return {
                                ...outcome,
                                ...( outcome?.competitor ? {competitor: outcome.competitor.id === competitor.id ? { id: outcome.competitor.id, name: outcome.competitor.name, picture: picture } : outcome.competitor } : {})
                            }})
                        }})
                    }})
                    await updateItem('Events', event.id, { competitors: competitors, ...(event.bets ? {bets: bets} : {}) })
                }
            }
            response.status = true
        }
        else {
            response.message = 'error uploading image.'
        }
    }
    else {
        response.message = 'no image uploaded.'
    }

    return response
}

export { uploadPicture }