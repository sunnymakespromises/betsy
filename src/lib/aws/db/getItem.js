import { ddbDocClient } from './ddbDocClient'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import queryTable from './queryTable'

export default async function getItem(table, key) {
    if (key.constructor.name === 'Object') {
        return await queryTable(table, key, true)
    }
    else {
        try {
            const params = {
                TableName: 'Betsy_' + table,
                Key: { id: key }
            }
            const { Item } = await ddbDocClient.send(new GetCommand(params))
            return Item
        } catch (err) {
            console.log('Error', err)
        }
    }
}