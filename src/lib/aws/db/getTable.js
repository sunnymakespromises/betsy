import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'

export default async function getTable(table, attributes = null) {
    let done = false
    let items = []
    const params = {
        TableName: 'Betsy_' + table
    }
    if (attributes) {
        const expressionAttributeNames = {}
        const projectionExpression = attributes.map(a => reserved_keywords.includes(a) ? '#' + a : a)
        for (const expression of projectionExpression) {
            if (expression.includes('#')) {
                expressionAttributeNames[expression] = expression.replace('#', '')
            }
        }
        params.ProjectionExpression = projectionExpression.join(', ')
        if (Object.keys(expressionAttributeNames).length !== 0) {
            params.ExpressionAttributeNames = expressionAttributeNames
        }
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