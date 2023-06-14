import { ddbDocClient } from './ddbDocClient'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import queryTable from './queryTable'

export default async function deleteItem(table, key) {
    if (key.constructor.name === 'Object') {
        try {
            const item = await queryTable(table, key, true)
            const params = {
                TableName: 'Betsy_' + table,
                Key: { id: item.id }
            }
            await ddbDocClient.send(new DeleteCommand(params))
        } catch (err) {
            console.log('Error', err.stack)
        }
    }
    else {
        try {
            const params = {
                TableName: 'Betsy_' + table,
                Key: { id: key }
            }
            await ddbDocClient.send(new DeleteCommand(params))
        } catch (err) {
            console.log('Error', err.stack)
        }
    }
}