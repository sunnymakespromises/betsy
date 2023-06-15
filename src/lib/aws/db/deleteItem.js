import { ddbDocClient } from './ddbDocClient'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import getItem from './getItem'

export default async function deleteItem(table, key) {
    if (key.constructor.name === 'Object') {
        const item = await getItem(table, key, null)
        const params = {
            TableName: 'Betsy_' + table,
            Key: { id: item.id }
        }
        try {
            await ddbDocClient.send(new DeleteCommand(params))
        } catch (err) {
            console.log('Error', err.stack)
        }
    }
    else {
        const params = {
            TableName: 'Betsy_' + table,
            Key: { id: key }
        }
        try {
            await ddbDocClient.send(new DeleteCommand(params))
        } catch (err) {
            console.log('Error', err.stack)
        }
    }
}