import { ddbDocClient } from './ddbDocClient'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'

export default async function updateItem(table, key, object) {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let letterIndex = 0
    let updateExpression = 'set '
    let expressionAttributeValues = {}
    for (let updateKey of Object.keys(object)) {
        let comma = Object.keys(object).indexOf(updateKey) !== Object.keys(object).length - 1 ? ', ' : ''
        updateExpression += updateKey + ' = :' + letters[letterIndex] + comma
        expressionAttributeValues[':' + letters[letterIndex]] = object[updateKey]
        letterIndex++
    }
    const params = {
        TableName: 'Betsy_' + table,
        Key: {
            id: key
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
    }
    try {
        await ddbDocClient.send(new UpdateCommand(params))
    } catch (err) {
        console.log('Error', err.stack)
    }
}