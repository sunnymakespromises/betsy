import { ddbDocClient } from './ddbDocClient'
import { BatchGetCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'
import getItem from './getItem'

export default async function getItems(table, keys, attributes = null) {
    if (keys.length === 1) {
        return [await getItem(table, keys[0], attributes)]
    }
    let tableName = 'betsy_' + table
    let params = {
        RequestItems: {
            [tableName]: {
                Keys: keys.map(key => { return { id: key }})
            }
        }
    }
    if (attributes) {
        const expressionAttributeNames = {}
        const projectionExpression = attributes.map(a => reserved_keywords.includes(a) ? '#' + a : a)
        for (const expression of projectionExpression) {
            if (expression.includes('#')) {
                expressionAttributeNames[expression] = expression.replace('#', '')
            }
        }
        params.RequestItems[tableName].ProjectionExpression = projectionExpression.join(', ')
        if (Object.keys(expressionAttributeNames).length !== 0) {
            params.RequestItems[tableName].ExpressionAttributeNames = expressionAttributeNames
        }
    }
    try {
        let done = false
        let items = []
        while (!done) {
            const { Responses, UnprocessedKeys } = await ddbDocClient.send(new BatchGetCommand(params))
            for (let response of Responses[tableName]) {
                items.push(response)
            }
            if (!UnprocessedKeys[tableName]) {
                done = true
            }
            else {
                params.RequestItems[tableName].Keys = UnprocessedKeys[tableName]
            }
        }
        return keys.map(key => items.find(item => item.id === key))
    } catch (err) {
        console.log('Error', err)
    }
}