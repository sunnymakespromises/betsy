import { ddbDocClient } from './ddbDocClient'
import { GetCommand } from '@aws-sdk/lib-dynamodb'

export default async function getItem(table, key) {
    try {
        const params = {
            TableName: 'Betsy_' + table,
            Key: {
                id: key
            }
        }
        const { Item } = await ddbDocClient.send(new GetCommand(params))
        return Item
    } catch (err) {
        console.log('Error', err)
    }
}