import { ddbDocClient } from './ddbDocClient'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import reserved_keywords from './aws_reserved_keywords'
const ESCAPE_CHAR = '/'

export default async function queryTable(table, query, attributes = null, single = false) {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    let letterIndex = 0
    let filterExpression = ''
    let expressionAttributeNames = {}
    let expressionAttributeValues = {}
    let words = getEscapedQuery(query)
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
                    arr[i-1] = arr[i] + arr[i-1]
                    arr.pop()
                    filterExpression = arr.join(' ') + ',' + next
                    next = ')'
                }
                if (words[i] === 'in') {
                    filterExpression += ' (' + next
                    next = ')'
                }
                expected = 'value'
                break
            case 'value':
                if (words[i].includes('[') && words[i].includes(']')) {
                    words[i] = words[i].replace('[', '').replace(']', '')
                    let values = words[i].split('"').filter(value => value !== '' && value !== ',')
                    for (let j = 0; j < values.length; j++) {
                        filterExpression += (j !== 0 ? ' ' : '') + ':' + letters[letterIndex] + (j !== values.length - 1 ? ',' : '')
                        expressionAttributeValues[':' + letters[letterIndex]] = getValue(values[j]);letterIndex++
                    }
                    filterExpression += next
                }
                else {
                    filterExpression += ' :' + letters[letterIndex] + next
                    expressionAttributeValues[':' + letters[letterIndex]] = getValue(words[i]);letterIndex++
                }
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
    let params = {
        TableName: 'betsy_' + table,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues
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
            if (Items.length > 0) {
                return Items[0]
            }
        }
        else {
            let done = false
            let items = []
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
        }
        return null
    } catch (err) {
        console.log('Error', err)
    }

    function getEscapedQuery(query) {
        let words = query.split(' ')
        if (query.includes(ESCAPE_CHAR)) {
            let indices = words.filter(w => w.includes(ESCAPE_CHAR) && w.split(ESCAPE_CHAR).length - 1 !== 2).map(w => words.indexOf(w))
            for (let i = 0; i < indices.length; i = i + 2) {
                let merged = ''
                for (let j = 0; j < indices[i + 1] - indices[i] + 1; j++) {
                    merged += ((j !== 0 ? ' ' : '') + words[j + indices[i]]).replace(ESCAPE_CHAR, '')
                    words[j + indices[i]] = 'DELETE'
                }
                words[indices[i]] = merged
            }
            words = words.filter(w => w !== 'DELETE').map(w => w.replaceAll(ESCAPE_CHAR, ''))
        }
        return words
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