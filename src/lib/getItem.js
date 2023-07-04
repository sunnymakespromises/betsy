import {default as getItemFromTable} from './aws/db/getItem'

async function getItem(category, id) {
    const response = {
        status: false,
        item: null,
        message: ''
    }
    let table
    switch (category) {
        case 'competitions':
            table = 'Competitions'
            break
        case 'competitors':
            table = 'Competitors'
            break
        case 'events':
            table = 'Events'
            break
        default:
            break
    }

    let item = await getItemFromTable(table, id, null)
    if (item) {
        response.status = true
        response.item = item
    }
    else {
        response.message = 'no ' + category + ' found with that ' + id + '.'
    }

    return response
}

export { getItem }