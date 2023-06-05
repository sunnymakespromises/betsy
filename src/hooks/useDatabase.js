import { useCookies } from 'react-cookie'
import { updateProfile as libUpdateProfile } from '../lib/updateProfile'

function useDatabase() {
    const [cookies, setCookie, removeCookie] = useCookies()

    async function insert() {
        
    }

    async function get() {
        
    }

    async function query() {
        
    }

    async function update() {

    }

    async function remove() {
        
    }

    async function updateProfile(key, value) {
        return await libUpdateProfile(cookies['oauth-refresh-token'], key, value)
    }

    return { insert, get, query, update, remove, updateProfile }
}

export { useDatabase }