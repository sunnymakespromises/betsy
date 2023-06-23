import getItem from '../aws/db/getItem'
import updateItem from '../aws/db/updateItem'
import insertFile from '../aws/s3/insertFile'
import removeFile from '../aws/s3/removeFile'
const short = require('short-uuid')

async function uploadPicture(category, object, value) {
    const response = {
        status: false,
        message: ''
    }

    if (value) {
        const fileName = short.generate() + '.png'
        const file = new File([await fetch(value).then(async res => await res.blob())], fileName, { type: 'image/png' })
        let bucket
        switch (category) {
            case 'Competitions':
                bucket = process.env.REACT_APP_AWS_COMPETITIONS_PICTURES_BUCKET
                break
            case 'Competitors':
                bucket = process.env.REACT_APP_AWS_COMPETITORS_PICTURES_BUCKET
                break
            default:
                break
        }
        if (await insertFile(bucket, file)) {
            let picture = 'https://' + bucket + '.s3.amazonaws.com/' + fileName
            let oldFile = object?.picture?.replace('https://' + bucket + '.s3.amazonaws.com/', '')
            if (oldFile) {
                await removeFile(bucket, oldFile)
            }
            await updateItem(category, object.id, { picture: picture })
            if (category === 'Competitions') {
                let competition = await getItem('Competitions', object.id, ['id', 'name', 'sport', 'events', 'competitors'])
                let competitions = (await getItem('Sports', competition.sport.id, ['id', 'competitions']))?.competitions?.map(c => { return c.id === competition.id ? { id: c.id, name: c.name, picture: picture } : c })
                await updateItem('Sports', competition.sport.id, { competitions: competitions })
                for (const event of competition.events) {
                    await updateItem('Events', event.id, { competition: { id: competition.id, name: competition.name, picture: picture } })
                }
                for (const competitor of competition.competitors) {
                    let competitions = (await getItem('Competitors', competitor.id, ['id', 'competitions']))?.competitions?.map(c => { return c.id === competition.id ?  { id: c.id, name: c.name, picture: picture } : c })
                    await updateItem('Competitors', competitor.id, { competitions: competitions })
                }
            }
            else if (category === 'Competitors') {
                let competitor = await getItem('Competitors', object.id, ['id', 'name', 'events', 'competitions'])
                for (let competition of competitor.competitions) {
                    let competitors = (await getItem('Competitions', competition.id, ['id', 'competitors']))?.competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: c.name, picture: picture } : c })
                    await updateItem('Competitions', competition.id, { competitors: competitors })
                }
                for (let event of competitor.events) {
                    let competitors = (await getItem('Events', event.id, ['id', 'competitors']))?.competitors.map(c => { return c.id === competitor.id ? { id: c.id, name: c.name, picture: picture } : c })
                    await updateItem('Events', event.id, { competitors: competitors })
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