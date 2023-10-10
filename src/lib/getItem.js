import {default as getItemFromTable} from './aws/db/getItem'

async function getItem(category, id) {
    const response = {
        status: false,
        item: null,
        message: ''
    }
    let item = await getItemFromTable(category, id, null)
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