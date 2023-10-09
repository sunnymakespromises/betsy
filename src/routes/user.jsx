import React, { memo, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Check, FileTextFill, HeartFill, StopwatchFill, X, XCircleFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useUserContext } from '../contexts/user'
import { useDatabase } from '../hooks/useDatabase'
import Page from '../components/page'
import Profile from '../components/profile'
import Conditional from '../components/conditional'
import Image from '../components/image'
import Text from '../components/text'
import Map from '../components/map'
import { MultiPanel } from '../components/panel'
import { getUserBy } from '../lib/getUserBy'
import Slips from '../components/slips'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/searchBar'

const User = memo(function User() {
    let DOMId = 'user'
    const { currentUser } = useUserContext()
    const [user, setUser] = useState()
    const [searchParams,] = useSearchParams()
    const userId = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])
    const isCurrentUser = useMemo(() => userId ? currentUser.id === userId : true, [currentUser, userId])
    const searchConfig = useMemo(() => { return {
        id: 'user_slips',
        filters: {
            live: {
                title: 'Live Bets',
                icon: (props) => <StopwatchFill {...props}/>,
                fn: (a) => a.filter(r => r.did_hit === null),
                turnsOff: ['hits', 'misses']
            },
            hits: {
                title: 'Hits',
                icon: (props) => <Check {...props}/>,
                fn: (a) => a.filter(r => r.did_hit === true),
                turnsOff: ['live', 'misses']
            },
            misses: {
                title: 'Misses',
                icon: (props) => <X {...props}/>,
                fn: (a) => a.filter(r => r.did_hit === false),
                turnsOff: ['hits', 'live']
            }
        },
        space: user?.slips,
        shape: 'array',
        keys: ['picks'],
        showAllOnInitial: true
    }}, [user])
    const search = useSearch(searchConfig)
    let panelsConfig = useMemo(() => [
        {
            category: 'div',
            divId: DOMId + '-column1',
            divClasses: 'grow flex flex-col gap-base md:gap-lg',
            children: [
                {
                    category: 'display',
                    children:
                        <Profile user = {user} isCurrentUser = {isCurrentUser} parentId = {DOMId}/>
                },
                {
                    category: 'panel',
                    key: 'favorites',
                    icon: HeartFill,
                    panelClasses: 'w-full md:w-[20rem] h-min',
                    parentId: DOMId + '-favorites',
                    children: 
                        <FavoritesPanel favorites = {user?.favorites} canEdit = {isCurrentUser} parentId = {DOMId}/>
                }
            ]
        },
        {
            category: 'panel',
            key: 'slips',
            icon: FileTextFill,
            panelClasses: 'w-full h-min',
            parentId: DOMId + '-slips',
            children: 
                user && 
                <div id = {DOMId + '-slips-panel-container'} className = {'flex flex-col gap-base ' + (search.results?.length > 0 ? 'md:gap-lg' : '') }>
                    <SearchBar {...search} classes = 'w-full' isExpanded = {false} canExpand = {false} parentId = {DOMId}/>
                    <Slips compressedSlips = {search.results?.sort((a, b) => b.timestamp - a.timestamp)} parentId = {DOMId}/>
                </div>
        }
    ], [user, isCurrentUser, currentUser, search])

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

    return (
        <Page canScroll DOMId = {DOMId}>
            {user && 
            <div id = {DOMId} className = 'w-full flex flex-col md:flex-row gap-base md:gap-lg'>
                <Helmet><title>User • Betsy</title></Helmet>
                <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
            </div>}
        </Page>
    )
})

const FavoritesPanel = memo(function FavoritesPanel({ favorites, canEdit, parentId }) {
    let DOMId = parentId + '-favorites'
    let allFavorites = useMemo(() => Object.keys(favorites).map(category => favorites[category].map(favorite => { return { ...favorite, category: category } })).flat(), [favorites])

    return (
        <div id = {DOMId} className = 'relative w-full h-min flex flex-col gap-base'>
            <Conditional value = {allFavorites.length > 0}>
                <div id = {DOMId + '-items'} className = 'w-full h-min grid grid-cols-6 justify-center items-center gap-xs'>
                    <Map items = {allFavorites} callback = {(favorite, index) => {
                        let favoriteId = DOMId + '-favorite' + index; return (
                        <Favorite key = {index} item = {favorite} canEdit = {canEdit} parentId = {favoriteId}/>
                    )}}/>
                </div>
            </Conditional>
            <Conditional value = {allFavorites.length < 1}>
                <Text id ={DOMId + '-notFound'} preset = 'body' classes = '!text-lg text-text-highlight/killed'>
                    No favorites found.
                </Text>
            </Conditional>
        </div>
    )
}, (b, a) => b.canEdit === a.canEdit && _.isEqual(b.favorites, a.favorites))

const Favorite = memo(function Favorite({ item: favorite, canEdit, parentId }) {
    let DOMId = parentId
    let { removeFromFavorites } = useDatabase()

    return (
        <Link id = {DOMId} to = {'/info?category=' + favorite.category + '&id=' + favorite.id} className = 'group/favorite relative w-full aspect-square flex justify-center items-center' title = {favorite.name}>
            <div id = {DOMId + '-image'} className = 'transition-colors duration-main w-full aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main group-hover/favorite:border-primary-highlight cursor-pointer'>
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
                <XCircleFill id = {DOMId + '-cancel-icon'} className = 'absolute transition-all duration-main -top-2xs -right-2xs w-5 h-5 md:w-4 md:h-4 cursor-pointer scale-1 md:scale-0 text-primary-main hover:text-primary-highlight bg-white rounded-full group-hover/favorite:!scale-100' onClick = {(e) => onRemove(e, favorite)}/>
            </Conditional>
        </Link>
    )

    function onRemove(e, favorite) {
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
        removeFromFavorites(favorite.category, favorite)
    }
}, (b, a) => _.isEqual(b.item, a.item) && b.canEdit === a.canEdit)

export default User