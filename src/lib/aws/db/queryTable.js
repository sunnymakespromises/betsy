import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'

export default async function queryTable(table, query, single = false) {
    try {
        let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        let letterIndex = 0
        let filterExpression = ''
        let expressionAttributeNames = {}
        let expressionAttributeValues = {}
        for (let updateKey of Object.keys(query)) {
            const keyIsReserved = reserved_keywords.includes(updateKey)
            let comma = Object.keys(query).indexOf(updateKey) !== Object.keys(query).length - 1 ? ' and ' : ''
            let pound = keyIsReserved ? '#' : ''
            filterExpression += pound + updateKey + ' = :' + letters[letterIndex] + comma
            expressionAttributeValues[':' + letters[letterIndex]] = query[updateKey]
            if (keyIsReserved) {
                expressionAttributeNames['#' + updateKey] = updateKey
            }
            letterIndex++
        }
        const params = {
            TableName: 'Betsy_' + table,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ConsistentRead: true
        }
        if (Object.keys(expressionAttributeNames).length !== 0) {
            params['ExpressionAttributeNames'] = expressionAttributeNames
        }
        const { Items } = await ddbDocClient.send(new ScanCommand(params))
        if (!single) {
            return Items
        }
        if (Items.length > 0) {
            return Items[0]
        }
        return null
    } catch (err) {
        console.log('Error', err)
    }
}