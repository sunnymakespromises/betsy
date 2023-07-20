import { useMemo, memo} from 'react'
import { useUserContext } from '../contexts/user'
import { useDatabase } from './useDatabase'
import { IconHeart } from '@tabler/icons-react'

function useFavorite(category, item) {
    const { currentUser } = useUserContext()
    const { addToFavorites, removeFromFavorites } = useDatabase()
    const favorites = useMemo(() => currentUser ? currentUser.favorites : null, [currentUser])
    const isFavorite = useMemo(() => category === 'events' ? favorites.competitors.some(f => item.competitors.some(c => c.id === f.id)) || favorites.competitions.some(f => item.competition.id === f.id) : favorites[category].some(f => f.id === item.id), [favorites, category, item])

    const Favorite = memo(function Favorite({ isFavorite, classes, iconClasses, canEdit = false, parentId }) {
        let DOMId = parentId + '-favorite'
        return (
            <div id = {DOMId} className = {'h-full aspect-square flex flex-col items-center justify-center' + (classes ? ' ' + classes : '')}>
                <IconHeart id = {DOMId + '-icon'} className = {'w-full h-full ' + (isFavorite ? 'fill-primary-main text-primary-main' : 'text-primary-main fill-transparent') + (canEdit ? ' hover:fill-primary-main cursor-pointer' : '') + (iconClasses ? ' ' + iconClasses : '')} onClick = {(e) => onClick(e)}/>
            </div>
        )
    
        function onClick(e) {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
            e.preventDefault()
            if (canEdit) {
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