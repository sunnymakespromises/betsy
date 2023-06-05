import { useCookies } from 'react-cookie'
import { updateProfile as _updateProfile } from '../lib/updateProfile'
import { getUserBy as _getUserBy } from '../lib/getUserBy'
import { follow as _follow, unfollow as _unfollow } from '../lib/follow'

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
        return await _updateProfile(cookies['oauth-refresh-token'], key, value)
    }

    async function getUserBy(key, value) {
        return await _getUserBy(key, value)
    }

    async function follow(id) {
        return await _follow(cookies['oauth-refresh-token'], id)
    }

    async function unfollow(id) {
        return await _unfollow(cookies['oauth-refresh-token'], id)
    }

    return { insert, get, query, update, remove, updateProfile, getUserBy, follow, unfollow }
}

export { useDatabase }