import { ddbDocClient } from './ddbDocClient'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'

export default async function updateItem(table, key, object) {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let letterIndex = 0
    let updateExpression = 'set '
    let expressionAttributeNames = {}
    let expressionAttributeValues = {}
    for (let updateKey of Object.keys(object)) {
        const keyIsReserved = reserved_keywords.includes(updateKey)
        let comma = Object.keys(object).indexOf(updateKey) !== Object.keys(object).length - 1 ? ', ' : ''
        let pound = keyIsReserved ? '#' : ''
        updateExpression += pound + updateKey + ' = :' + letters[letterIndex] + comma
        expressionAttributeValues[':' + letters[letterIndex]] = object[updateKey]
        if (keyIsReserved) {
            expressionAttributeNames['#' + updateKey] = updateKey
        }
        letterIndex++
    }
    const params = {
        TableName: 'Betsy_' + table,
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