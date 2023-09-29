import { ddbDocClient } from './ddbDocClient'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'

export default async function incrementItem(table, key, column) {
    let updateExpression = 'add ' + column + ' :inc'
    let expressionAttributeNames = {}
    let expressionAttributeValues = { ':inc': 1 }
    const columnIsReserved = column.split('.').some(k => reserved_keywords.includes(k))
    if (columnIsReserved) {
        const reservedKeys = key.split('.').filter(k => k.includes('#'))
        for (const reservedKey of reservedKeys) {
            expressionAttributeNames[reservedKey] = reservedKey.replace('#', '')
        }
    }
    const params = {
        TableName: 'betsy_' + table,
        Key: key.constructor.name === 'Object' ? key : { id: key },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
    }
    if (Object.keys(expressionAttributeNames).length !== 0) {
        params['ExpressionAttributeNames'] = expressionAttributeNames
    }
    try {
        await ddbDocClient.send(new UpdateCommand(params))
    } catch (err) {
        console.log('Error', err.stack)
    }
}