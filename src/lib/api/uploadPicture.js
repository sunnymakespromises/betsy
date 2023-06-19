import getItem from '../aws/db/getItem'
import updateItem from '../aws/db/updateItem'
import insertFile from '../aws/s3/insertFile'
const short = require('short-uuid')

async function uploadPicture(category, object, value) {
    const response = {
        status: false,
        message: ''
    }
    let log = {
        reads: 0,
        writes: 0,
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
        if (await insertFile(bucket, file)) {log.writes++
            let picture = 'https://' + bucket + '.s3.amazonaws.com/' + fileName
            await updateItem(category, object.id, { picture: picture })
            switch (category) {
                case 'Competitions':
                    let competition = await getItem('Competitions', object.id, ['id', 'name', 'sport', 'events', 'competitors'])
                    let competitions = (await getItem('Sports', competition.sport.id, ['id', 'competitions']))?.competitions?.map(c => {return c.id === competition.id ? { id: c.id, name: c.name, picture: picture } : c });log.reads++
                    await updateItem('Sports', competition.sport.id, { competitions: competitions });log.writes++
                    for (const event of competition.events) {
                        await updateItem('Events', event.id, { competition: { id: competition.id, name: competition.name, picture: picture } });log.writes++
                    }
                    for (const competitor of competition.competitors) {
                        let competitions = (await getItem('Competitors', competitor.id, ['id', 'competitions']))?.competitions?.map(c => {return c.id === competition.id ?  { id: c.id, name: c.name, picture: picture } : c });log.reads++
                        await updateItem('Competitors', competitor.id, { competitions: competitions });log.writes++
                    }
                    break
                case 'Competitors':
                    break
                default:
                    break
            }
            response.status = true
        }
        else {
            response.message = 'error uploading image.'
        }
        console.log(log)
    }
    else {
        response.message = 'no image uploaded.'
    }

    return response
}

export { uploadPicture }