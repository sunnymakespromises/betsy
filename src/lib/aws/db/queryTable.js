import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'

export default async function queryTable(table, query, attributes = null, single = false) {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let letterIndex = 0
    let filterExpression = ''
    let expressionAttributeNames = {}
    let expressionAttributeValues = {}
    if (query.constructor.name === 'String') {
        let words = query.split(' ')
        let expected = 'attribute'
        let next = ''
        for (let i = 0; i < words.length; i++) {
            switch (expected) {
                case 'attribute':
                    const isReserved = words[i].split('.').some(w => reserved_keywords.includes(w))
                    filterExpression += ((i !== 0 ? ' ' : '') + (isReserved ? words[i].split('.').map(w => reserved_keywords.includes(w) ? '#' + w : w).join('.') : words[i])) + next
                    if (isReserved) {
                        const reservedAttributes = filterExpression.split(' ')[i].split('.').filter(w => w.includes('#'))
                        for (const reservedAttribute of reservedAttributes) {
                            expressionAttributeNames[reservedAttribute] = reservedAttribute.replace('#', '')
                        }
                    }
                    expected = 'operator'
                    break
                case 'operator':
                    filterExpression += ' ' + words[i]
                    if (words[i] === 'contains') {
                        filterExpression += '('
                        let arr = filterExpression.split(' ')
                        filterExpression = (arr.with(i,arr[i-1]).with(i-1,arr[i]).join(' ')) + ',' + next
                        next = ')'
                    }
                    expected = 'value'
                    break
                case 'value':
                    filterExpression += ' :' + letters[letterIndex] + next
                    expressionAttributeValues[':' + letters[letterIndex]] = getValue(words[i]);letterIndex++
                    expected = 'logic'
                    break
                case 'logic':
                    filterExpression += ' ' + words[i] + next
                    expected = 'attribute'
                    break
                default:
                    break
            }
        }
    }
    let params = {
        TableName: 'Betsy_' + table,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ConsistentRead: true
    }
    if (attributes) {
        const projectionExpression = attributes.map(a => reserved_keywords.includes(a) ? '#' + a : a)
        projectionExpression.forEach(e => e.includes('#') ? expressionAttributeNames[e] = e.replace('#', '') : null)
        params.ProjectionExpression = projectionExpression.join(', ')
    }
    if (Object.keys(expressionAttributeNames).length !== 0) { params.ExpressionAttributeNames = expressionAttributeNames }
    try {
        if (single) {
            const { Items } = await ddbDocClient.send(new ScanCommand(params))
            if (Items.length > 0) { return Items[0] }
        }
        else {
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
        return null
    } catch (err) {
        console.log('Error', err)
    }

    function getValue(value) {
        switch (value.split(':')[0]) {
            case 'N': return Number(value.substr(2))
            default: 
                if (value === 'true' || value === 'false') {
                    return value === 'true'
                }
                return value
        }
    }
}