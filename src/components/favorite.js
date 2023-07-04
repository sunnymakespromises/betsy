import { memo } from 'react'
import _ from 'lodash'
import { useDatabase } from '../hooks/useDatabase'
import { IconHeart } from '@tabler/icons-react'

const Favorite = memo(function Favorite({ category, item, favorites, classes, iconClasses, parentId }) {
    const { addToFavorites, removeFromFavorites } = useDatabase()
    let isFavorite = favorites[category]?.some(f => f.id === item.id)
    let DOMId = parentId + 'favorite-'
    return (
        <div id = {DOMId + 'container'} className = {'h-full aspect-square cursor-pointer' + (classes ? ' ' + classes : '')}>
            <IconHeart id = {DOMId + 'icon'} className = {'!transition-all duration-main w-full h-full cursor-pointer ' + (isFavorite ? 'fill-primary-main text-primary-main' : 'text-transparent fill-transparent group-hover:text-primary-main hover:fill-primary-main') + (iconClasses ? ' ' + iconClasses : '')} onClick = {onClick}/>
        </div>
    )

    function onClick() {
        if (isFavorite) {
            removeFromFavorites(category, item)
        } else {
            addToFavorites(category, item)
        }
    }
}, (b, a) => b.category === a.category && b.item.id  === a.item.id && _.isEqual(b.favorites, a.favorites) && b.children === a.children && b.iconClasses === a.iconClasses) // the component already re-renders everytime currentUsers changes sadly due to the useDatabase hook

export default Favorite