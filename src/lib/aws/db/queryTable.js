import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'

// has optional 'mode' key in query
export default async function queryTable(table, query, attributes = null, single = false) {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let letterIndex = 0
    let filterExpression = ''
    let expressionAttributeNames = {}
    let expressionAttributeValues = {}
    for (let updateKey of Object.keys(query).filter(k => k !== 'mode')) {
        const keyIsReserved = updateKey.split('.').some(k => reserved_keywords.includes(k))
        let prefix = query.mode === 'contains' ? 'contains(' : ''
        let key = keyIsReserved ? updateKey.split('.').map(k => reserved_keywords.includes(k) ? '#' + k : k).join('.') : updateKey
        let separator = query.mode === 'contains' ? ', :' : ' = :'
        let suffix = Object.keys(query).indexOf(updateKey) !== Object.keys(query).length - 1 ? query.mode === 'contains' ? ') and ' :  ' and ' : query.mode === 'contains' ? ')' : ''
        filterExpression += prefix + key + separator + letters[letterIndex] + suffix
        expressionAttributeValues[':' + letters[letterIndex]] = query[updateKey]
        if (keyIsReserved) {
            const reservedKeys = key.split('.').filter(k => k.includes('#'))
            for (const reservedKey of reservedKeys) {
                expressionAttributeNames[reservedKey] = reservedKey.replace('#', '')
            }
        }
        letterIndex++
    }
    let params = {
        TableName: 'Betsy_' + table,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ConsistentRead: true
    }
    if (attributes) {
        const projectionExpression = attributes.map(a => reserved_keywords.includes(a) ? '#' + a : a)
        for (const expression of projectionExpression) {
            if (expression.includes('#')) {
                expressionAttributeNames[expression] = expression.replace('#', '')
            }
        }
        params.ProjectionExpression = projectionExpression.join(', ')
    }
    if (Object.keys(expressionAttributeNames).length !== 0) {
        params.ExpressionAttributeNames = expressionAttributeNames
    }
    try {
        if (!single) {
            let done = false
            let items = []
            while (!done) {
                const { Items, LastEvaluatedKey } = await ddbDocClient.send(new ScanCommand(params))
                for (let item of Items) { items.push(item) }
                if (!LastEvaluatedKey) { done = true }
                else { params.ExclusiveStartKey = LastEvaluatedKey }
            }
            return items
        }
        else {
            const { Items } = await ddbDocClient.send(new ScanCommand(params))
            if (Items.length > 0) { return Items[0] }
        }
        return null
    } catch (err) {
        console.log('Error', err)
    }
}