import { useMemo, memo} from 'react'
import { useUserContext } from '../contexts/user'
import { useDatabase } from './useDatabase'
import { IconHeart } from '@tabler/icons-react'

function useFavorite(category, item) {
    const { currentUser } = useUserContext()
    const { addToFavorites, removeFromFavorites } = useDatabase()
    const favorites = useMemo(() => currentUser ? currentUser.favorites : null, [currentUser])
    const isFavorite = useMemo(() => {
        if (favorites && item) {
            if (category === 'events') {
                return favorites.competitors.some(f => item.competitors.some(c => c.id === f.id)) || favorites.competitions.some(f => item.competition.id === f.id)
            }
            else {
                return favorites[category]?.some(f => f.id === item.id)
            }
        }
        return false
    }, [favorites, category, item])

    const Favorite = memo(function Favorite({ isFavorite, classes, iconClasses, canEdit = false, parentId }) {
        let DOMId = parentId + 'favorite-'
        return (
            <div id = {DOMId + 'container'} className = {'h-full aspect-square flex flex-col items-center justify-center' + (classes ? ' ' + classes : '')}>
                <IconHeart id = {DOMId + 'icon'} className = {'w-full h-full ' + (isFavorite ? 'fill-primary-main text-primary-main' : 'text-primary-main fill-transparent') + (canEdit ? ' hover:fill-primary-main cursor-pointer' : '') + (iconClasses ? ' ' + iconClasses : '')} onClick = {onClick}/>
            </div>
        )
    
        function onClick() {
            if (canEdit) {
                if (isFavorite) {
                    removeFromFavorites(category, item)
                } else {
                    addToFavorites(category, item)
                }
            }
        }
    }, (b, a) => b.isFavorite === a.isFavorite && b.classes === a.classes && b.iconClasses === a.iconClasses && b.canEdit === a.canEdit)

    return { isFavorite, Favorite }
}

export { useFavorite }