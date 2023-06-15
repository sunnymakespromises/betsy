import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export default async function getTable(table) {
    let done = false
    let items = []
    const params = {
        TableName: 'Betsy_' + table
    }
    try {
        while (!done) {
            const { Items, LastEvaluatedKey } = await ddbDocClient.send(new ScanCommand(params))
            for (let item of Items) {
                items.push(item)
            }
            if (!LastEvaluatedKey) {
                done = true
            }
            else {
                params.ExclusiveStartKey = LastEvaluatedKey
            }
        }
        return items
    } catch (err) {
        console.log('Error', err)
    }
}