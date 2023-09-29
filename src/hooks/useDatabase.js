import { updateProfile as _updateProfile } from '../lib/updateProfile'
import { getUserBy as _getUserBy } from '../lib/getUserBy'
import { getItem as _getItem } from '../lib/getItem'
import { placeBet as _placeBet } from '../lib/placeBet'
import { subscribe as _subscribe, unsubscribe as _unsubscribe } from '../lib/subscription'
import { addToFavorites as _addToFavorites, removeFromFavorites as _removeFromFavorites, rearrangeFavorites as _rearrangeFavorites } from '../lib/favorite'
import { useUserContext } from '../contexts/user'
import { useCallback } from 'react'

function useDatabase() {
    const { currentUser, updateCurrentUser } = useUserContext()

    const updateProfile = useCallback(async function updateProfile(key, value) {
        const response = await _updateProfile(currentUser, key, value)
        if (response.status) {
            await updateCurrentUser(key, value)
        }
        return response
    }, [currentUser])

    const getUserBy = useCallback(async function getUserBy(key, value) {
        return await _getUserBy(key, value)
    }, [currentUser])

    const getItem = useCallback(async function getUserBy(category, id) {
        return await _getItem(category, id)
    }, [currentUser])

    const subscribe = useCallback(async function subscribe(id) {
        const { status, changes } = await _subscribe(currentUser, id)
        if (status) {
            await updateCurrentUser(changes)
        }
    }, [currentUser])

    const unsubscribe = useCallback(async function unsubscribe(id) {
        const { status, changes } = await _unsubscribe(currentUser, id)
        if (status) {
            await updateCurrentUser(changes)
        }
    }, [currentUser])

    const addToFavorites = useCallback(async function addToFavorites(category, object) {
        const { status, changes } = await _addToFavorites(currentUser, category, object)
        if (status) {
            await updateCurrentUser(changes)
        }
    }, [currentUser])

    const removeFromFavorites = useCallback(async function removeFromFavorites(category, object) {
        const { status, changes } = await _removeFromFavorites(currentUser, category, object)
        if (status) {
            await updateCurrentUser(changes)
        }
    }, [currentUser])

    const rearrangeFavorites = useCallback(async function rearrangeFavorites(category, source, target) {
        const { status, changes } = await _rearrangeFavorites(currentUser, category, source, target)
        if (status) {
            await updateCurrentUser(changes)
        }
    }, [currentUser])

    const placeBet = useCallback(async function placeBet(expandedSlip, wager, odds, potentialEarnings) {
        const { status, message, changes } = await _placeBet(currentUser, expandedSlip, wager, odds, potentialEarnings)
        if (status) {
            await updateCurrentUser(changes)
        }
        return { status, message }
    }, [currentUser])

    return { updateProfile, getUserBy, getItem, subscribe, unsubscribe, addToFavorites, removeFromFavorites, rearrangeFavorites, placeBet }
}

export { useDatabase }