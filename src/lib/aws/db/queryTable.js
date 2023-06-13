import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export default async function queryTable(table, query) {
    try {
        let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        let letterIndex = 0
        let filterExpression = ''
        let expressionAttributeValues = {}
        for (let updateKey of Object.keys(query)) {
            let comma = Object.keys(query).indexOf(updateKey) !== Object.keys(query).length - 1 ? ' and ' : ''
            filterExpression += updateKey + ' = :' + letters[letterIndex] + comma
            expressionAttributeValues[':' + letters[letterIndex]] = query[updateKey]
            letterIndex++
        }
        const params = {
            TableName: 'Betsy_' + table,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ConsistentRead: true
        }

        const { Items } = await ddbDocClient.send(new ScanCommand(params))
        return Items
    } catch (err) {
        console.log('Error', err)
    }
}