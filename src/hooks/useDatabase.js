import { useCookies } from 'react-cookie'
import { updateProfile as _updateProfile } from '../lib/updateProfile'
import { getUserBy as _getUserBy } from '../lib/getUserBy'
import { subscribe as _subscribe, unsubscribe as _unsubscribe } from '../lib/subscribe'

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
        return await _updateProfile(cookies['oauth_refresh_token'], cookies['oauth_source'], key, value)
    }

    async function getUserBy(key, value) {
        return await _getUserBy(key, value)
    }

    async function subscribe(id) {
        return await _subscribe(cookies['oauth_refresh_token'], cookies['oauth_source'], id)
    }

    async function unsubscribe(id) {
        return await _unsubscribe(cookies['oauth_refresh_token'], cookies['oauth_source'], id)
    }

    return { insert, get, query, update, remove, updateProfile, getUserBy, subscribe, unsubscribe }
}

export { useDatabase }