import { ddbDocClient } from './ddbDocClient'
import { PutCommand } from '@aws-sdk/lib-dynamodb'

export default async function insertItem(table, object) {
    const params = {
        TableName: 'betsy_' + table,
        Item: object
    }
    try {
        await ddbDocClient.send(new PutCommand(params))
    } catch (err) {
        console.log('Error', err.stack)
    }
}