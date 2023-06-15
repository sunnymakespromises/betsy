import { ddbDocClient } from './ddbDocClient'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import queryTable from './queryTable'

export default async function getItem(table, key) {
    if (key.constructor.name === 'Object') {
        return await queryTable(table, key, true)
    }
    else {
        const params = {
            TableName: 'Betsy_' + table,
            Key: { id: key }
        }
        try {
            return await ddbDocClient.send(new GetCommand(params))
        } catch (err) {
            console.log('Error', err)
        }
    }
}