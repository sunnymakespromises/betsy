import { ddbDocClient } from './ddbDocClient'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import queryTable from './queryTable'
import reserved_keywords from './aws_reserved_keywords'

export default async function getItem(table, key, attributes = null) {
    if (key.constructor.name === 'Object') {
        return await queryTable(table, key, attributes, true)
    }
    else {
        let params = {
            TableName: 'Betsy_' + table,
            Key: { id: key }
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
            const { Item } = await ddbDocClient.send(new GetCommand(params))
            return Item
        } catch (err) {
            console.log('Error', err)
        }
    }
}