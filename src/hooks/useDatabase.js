import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import databaseOperation from '../lib/databaseOperation'

function useDatabase() {
    const [cookies, setCookie, removeCookie] = useCookies()

    async function query({table, query, fn}) {
        return await databaseOperation({
            operation: 'query',
            table: table,
            data: { query: query },
            fn: fn
        })
    }

    async function insert({table, data, key = null, fn}) {
        if (key) {
            return await databaseOperation({
                operation: 'insert',
                table: table,
                data: { key: key, ...data },
                fn: fn
            })
        }
        return await databaseOperation({
            operation: 'insert',
            table: table,
            data: { refresh_token: cookies['oauth-refresh-token'], ...data },
            fn: fn
        })
    }

    async function remove({table, key = null, fn}) {
        if (key) {
            return await databaseOperation({
                operation: 'remove',
                table: table,
                data: { key: key },
                fn: fn
            })
        }
        return await databaseOperation({
            operation: 'remove',
            table: table,
            data: { refresh_token: cookies['oauth-refresh-token'] },
            fn: fn
        })
    }

    async function update({table, data, key = null, fn}) {
        if (key) {
            return await databaseOperation({
                operation: 'update',
                table: table,
                data: { key: key, data: data },
                fn: fn
            })
        }
        return await databaseOperation({
            operation: 'update', 
            table: table, 
            data: { refresh_token: cookies['oauth-refresh-token'], data: data },
            fn: fn
        })
    }

    return [ insert, query, update, remove ]
}

export { useDatabase }