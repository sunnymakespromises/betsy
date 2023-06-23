import { useCookies } from 'react-cookie'
import { updateProfile as _updateProfile } from '../lib/updateProfile'
import { getUserBy as _getUserBy } from '../lib/getUserBy'
import { subscribe as _subscribe, unsubscribe as _unsubscribe } from '../lib/subscription'
import { addToFavorites as _addToFavorites, removeFromFavorites as _removeFromFavorites } from '../lib/favorite'
import { useRootContext } from '../contexts/root'

function useDatabase() {
    const { refreshCurrentUser, refreshData } = useRootContext()
    const [cookies,,] = useCookies()

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
        const { status } = await _subscribe(cookies['oauth_refresh_token'], cookies['oauth_source'], id)
        if (status) {
            await refreshCurrentUser()
            await refreshData()
        }
    }

    async function unsubscribe(id) {
        const { status } = await _unsubscribe(cookies['oauth_refresh_token'], cookies['oauth_source'], id)
        if (status) {
            await refreshCurrentUser()
            await refreshData()
        }
    }

    async function addToFavorites(category, object) {
        const { status } = await _addToFavorites(cookies['oauth_refresh_token'], cookies['oauth_source'], category, object)
        if (status) {
            await refreshCurrentUser()
            await refreshData()
        }
    }

    async function removeFromFavorites(category, object) {
        const { status } = await _removeFromFavorites(cookies['oauth_refresh_token'], cookies['oauth_source'], category, object)
        if (status) {
            await refreshCurrentUser()
            await refreshData()
        }
    }

    return { insert, get, query, update, remove, updateProfile, getUserBy, subscribe, unsubscribe, addToFavorites, removeFromFavorites }
}

export { useDatabase }