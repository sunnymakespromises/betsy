import { ddbDocClient } from './ddbDocClient'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'

export default async function deleteItem(table, key) {
    const params = {
        TableName: 'Betsy_' + table,
        Key: key.constructor.name === 'Object' ? key : { id: key }
    }
    try {
        await ddbDocClient.send(new DeleteCommand(params))
    } catch (err) {
        console.log('Error', err.stack)
    }
}