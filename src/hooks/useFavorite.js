import { useMemo, memo} from 'react'
import { HeartFill } from 'react-bootstrap-icons'
import { useUserContext } from '../contexts/user'
import { useDatabase } from './useDatabase'
import Conditional from '../components/conditional'

function useFavorite(category, item) {
    const { currentUser } = useUserContext()
    const { addToFavorites, removeFromFavorites } = useDatabase()
    const isFavorite = useMemo(() => {
        if (category === 'events') {
            return currentUser.favorites.competitors.some(f => item.competitors.some(c => c.id === f.id)) || currentUser.favorites.competitions.some(f => item.competition.id === f.id)
        }
        if (category === 'users') {
            return currentUser.subscriptions.some(s => s.id === item.id)
        }
        return currentUser.favorites[category].some(f => f.id === item.id)
    }, [currentUser, category, item])

    const Favorite = memo(function Favorite({ isFavorite, classes, iconClasses, canEdit = false, parentId }) {
        let DOMId = parentId + '-favorite'
        return (
            <div id = {DOMId} className = {(classes ? ' ' + classes : '')}>
                <Conditional value = {canEdit || (!canEdit && isFavorite)}>
                    <HeartFill id = {DOMId + '-icon'} className = {'!transition-colors duration-main !w-full !h-full ' + (isFavorite ? 'text-primary-main' : 'text-primary-main/killed') + (canEdit ? ' hover:text-primary-main cursor-pointer' : '') + (iconClasses ? ' ' + iconClasses : '')} onClick = {(e) => onClick(e)}/>
                </Conditional>
            </div>
        )
    
        function onClick(e) {
            if (canEdit) {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
                e.preventDefault()
                if (isFavorite) {
                    removeFromFavorites(category, item)
                } else {
                    addToFavorites(category, item)
                }
            }
        }
    })

    return [isFavorite, Favorite]
}

export { useFavorite }