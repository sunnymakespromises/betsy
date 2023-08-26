import React, { forwardRef, memo, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { HeartFill, XCircleFill } from 'react-bootstrap-icons'
import { rectSortingStrategy } from '@dnd-kit/sortable'
import _ from 'lodash'
import { useUserContext } from '../contexts/user'
import { useDatabase } from '../hooks/useDatabase'
import Page from '../components/page'
import Profile from '../components/profile'
import Conditional from '../components/conditional'
import Image from '../components/image'
import Text from '../components/text'
import Map from '../components/map'
import Sort from '../components/sort'
import Panel from '../components/panel'
import { getUserBy } from '../lib/getUserBy'

const User = memo(function User() {
    const { currentUser } = useUserContext()
    const [user, setUser] = useState()
    const [searchParams,] = useSearchParams()
    const userId = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])
    const isCurrentUser = useMemo(() => userId ? currentUser.id === userId : true, [currentUser, userId])

    useEffect(() => {
        async function updateUser() {
            if (isCurrentUser) {
                setUser(currentUser)
            }
            else {
                let { status, user } = await getUserBy('id', userId)
                if (status) {
                    setUser(user)
                }
            }
        }

        updateUser()
    }, [currentUser, userId])

    let DOMId = 'user'
    return (
        <Page canScroll DOMId = {DOMId}>
            {user && <div id = {DOMId} className = 'w-full h-full flex flex-col md:flex-row'>
                <Helmet><title>User • Betsy</title></Helmet>
                <div id = {DOMId + '-group-1-container'} className = 'w-full h-min md:w-min md:h-full flex flex-col gap-base md:gap-lg'>
                    <Profile user = {user} isCurrentUser = {isCurrentUser} parentId = {DOMId} canEdit = {false}/>
                    <FavoritesPanel favorites = {user?.favorites} canEdit = {isCurrentUser} parentId = {DOMId}/>
                </div>
                <div id = {DOMId + '-group-2-container'} className = 'grow h-full'>

                </div>
            </div>}
        </Page>
    )
})

const FavoritesPanel = memo(function FavoritesPanel({ favorites, canEdit, parentId }) {
    let processedFavorites = useMemo(() => {
        let newFavorites = Object.fromEntries(Object.keys(favorites).filter(category => favorites[category].length > 0).map(category => [category, favorites[category]]))
        if (Object.keys(newFavorites).length > 0) {
            Object.keys(newFavorites).forEach(category => newFavorites[category] = favorites[category].map(favorite => { return { ...favorite, category: category }}))
        }
        return newFavorites
    }, [favorites])

    let DOMId = parentId + '-favorites'
    return (
        <Panel title = 'Favorites' icon = {(props) => <HeartFill {...props}/>} parentId = {DOMId}>
            <div id = {DOMId} className = 'relative w-full h-min flex flex-col gap-lg'>
                <Conditional value = {Object.keys(processedFavorites).length > 0}>
                    <Map items = {Object.keys(processedFavorites)} callback = {(category, index) => {
                        let categoryId = DOMId + '-category' + index; return (
                        <FavoritesGroup key = {index} favorites = {processedFavorites[category]} canEdit = {canEdit} parentId = {categoryId}/>
                    )}}/>
                </Conditional>
                <Conditional value = {Object.keys(processedFavorites).length < 1}>
                    <Text id ={DOMId + '-notFound'} preset = 'body' classes = 'w-full h-full flex justify-center items-center !text-lg text-text-highlight/killed'>
                        No favorites found.
                    </Text>
                </Conditional>
            </div>
        </Panel>
    )
}, (b, a) => b.canEdit === a.canEdit && _.isEqual(b.favorites, a.favorites))

const FavoritesGroup = memo(function FavoritesGroup({ favorites, canEdit, parentId }) {
    let { rearrangeFavorites } = useDatabase()

    let DOMId = parentId
    return (
        <div id = {DOMId + '-items'} className = 'w-full h-min grid grid-cols-6 justify-center items-center gap-xs'>
            {canEdit && 
            <Sort items = {favorites} item = {Favorite} itemProps = {{canEdit: canEdit}} onPlace = {onPlace} strategy = {[rectSortingStrategy]} parentId = {DOMId}/>}
            {!canEdit && 
            <Map items = {favorites} callback = {(favorite, index) => {
                let favoriteId = DOMId + '-favorite' + index; return (
                <Favorite key = {index} item = {favorite} canEdit = {canEdit} parentId = {favoriteId}/>
            )}}/>}
        </div>
    )

    async function onPlace(active, over) {
        await rearrangeFavorites(active.category, active, over)
    }
}, (b, a) => b.canEdit === a.canEdit && _.isEqual(b.favorites, a.favorites))

const Favorite = forwardRef(function Favorite({ item: favorite, canEdit, isDragging, somethingIsDragging, parentId, ...sortProps }, sortRef) {
    let { removeFromFavorites } = useDatabase()

    let DOMId = parentId
    return (
        <Link id = {DOMId} to = {'/info?category=' + favorite.category + '&id=' + favorite.id} className = {'group/favorite relative w-full aspect-square flex justify-center items-center' + (isDragging ? ' z-10' : '')} title = {favorite.name} {...sortProps} ref = {sortRef}>
            <div id = {DOMId + '-image'} className = {'}transition-colors duration-main w-full aspect-square flex justify-center items-center bg-white rounded-full border-base ' + (isDragging ? 'border-primary-highlight' : 'border-primary-main group-hover/favorite:border-primary-highlight') + ' cursor-pointer'}>
                <Conditional value = {favorite.picture}>
                    <Image id = {DOMId + '-image-image'} external path = {favorite.picture} classes = 'relative w-inscribed aspect-square'>
                    </Image>
                </Conditional>
                <Conditional value = {!favorite.picture}>
                    <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted text-center p-base'>
                        {favorite.name.substr(0, 1)}
                    </Text>
                </Conditional>
            </div>
            <Conditional value = {canEdit}>
                <XCircleFill id = {DOMId + '-cancel-icon'} className = {'absolute transition-all duration-main top-0 right-0 w-4 h-4 cursor-pointer scale-1 md:scale-0 text-primary-main hover:text-primary-highlight bg-white rounded-full ' + (!isDragging && !somethingIsDragging ? ' group-hover/favorite:!scale-100' : '')} onClick = {(e) => onRemove(e, favorite)}/>
            </Conditional>
        </Link>
    )

    function onRemove(e, favorite) {
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
        removeFromFavorites(favorite.category, favorite)
    }
})

export default User