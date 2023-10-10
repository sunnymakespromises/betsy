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
import { useCurrency } from '../hooks/useCurrency'
import { useOdds } from '../hooks/useOdds'

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
            divClasses: 'w-min flex flex-col gap-base',
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
                    panelClasses: 'w-full h-min',
                    parentId: DOMId + '-favorites',
                    children: 
                        <Favorites favorites = {user?.favorites} canEdit = {isCurrentUser} parentId = {DOMId}/>
                },
                ...(user?.slips?.length > 0 ? [{
                    category: 'div',
                    divId: DOMId + '-stats',
                    divClasses: 'w-full',
                    children: [
                        {
                            category: 'display',
                            children:
                                <Stats user = {user} parentId = {DOMId}/>
                        },
                    ]
                }] : [])
            ]
        },
        ...(user?.slips?.length > 0 ? [{
            category: 'panel',
            key: 'slips',
            icon: FileTextFill,
            panelClasses: 'w-full h-min',
            parentId: DOMId + '-slips',
            children: 
                <div id = {DOMId + '-slips-panel-container'} className = 'flex flex-col gap-base'>
                    <SearchBar {...search} classes = 'w-full' isExpanded = {false} canExpand = {false} parentId = {DOMId}/>
                    <Slips compressedSlips = {search.results?.sort((a, b) => b.timestamp - a.timestamp)} parentId = {DOMId}/>
                </div>
        }] : [])
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
            <div id = {DOMId} className = 'w-full flex flex-col md:flex-row gap-base'>
                <Helmet><title>User • Betsy</title></Helmet>
                <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
            </div>}
        </Page>
    )
})

const Stats = memo(function Stats({ user, parentId }) {
    let DOMId = parentId + '-favorites'
    const { getAmount } = useCurrency()
    const { getOdds } = useOdds()
    let stats = useMemo(() => {
        let hits = user.slips.filter(slip => slip.did_hit === true)
        return [
            {
                title: 'Hit Rate',
                value: hits.length > 0 ? ((hits.length / user.slips.length).toFixed(2) * 100) + '%' : null
            },
            {
                title: 'Net Spend',
                value: getAmount('dollars', null, user.balances[user.balances.length - 1].value - 10, false).string
            },
            {
                title: 'Payout/Slip',
                value: hits.length > 0 ? getAmount('dollars', null, user.slips.map(slip => slip.did_hit !== null ? (slip.did_hit ? slip.potential_earnings : -1 * slip.wager) : 0).reduce((a, b) => a + b) / user.slips.length, false).string : null
            },
            {
                title: 'Peak Balance',
                value: getAmount('dollars', null, Math.max(...user.balances.map(balance => balance.value)), false).string
            },
            {
                title: 'Lowest Balance',
                value: getAmount('dollars', null, Math.min(...user.balances.map(balance => balance.value)), false).string
            },
            {
                title: 'Longest Odds',
                value: hits.length > 0 ? getOdds(Math.max(...hits.map(slip => slip.odds), 0)) : null
            },
            {
                title: 'Largest Parlay',
                value: hits.length > 0 ? Math.max(...hits.map(slip => slip.picks.length), 0) : null
            },
            {
                title: 'Avg Odds/Slip',
                value: getOdds((user.slips.map(slip => slip.odds).reduce((a, b) => a + b) / user.slips.length))
            }
        ]
    }, [user])

    return (
        <div id = {DOMId} className = 'relative w-full h-min flex flex-wrap gap-base'>
            <Map items = {stats} callback = {(stat, index) => {
                let statId = DOMId + '-stat' + index; return stat.value && (
                <Stat key = {index} title = {stat.title} value = {stat.value} parentId = {statId}/>
            )}}/>
        </div>
    )
}, (b, a) => _.isEqual(b.user, a.user))

const Stat = memo(function Stat({ title, value, parentId }) {
    let DOMId = parentId

    return (
        <div id = {DOMId} className = 'transition-colors duration-main w-min flex flex-col items-center gap-sm p-base bg-base-highlight rounded-base'>
            <Text id = {DOMId + '-title'} preset = 'body' classes = 'text-text-highlight whitespace-nowrap'>
                {title}
            </Text>
            <Text id = {DOMId + '-amount'} preset = 'body' classes = 'whitespace-nowrap text-text-highlight !font-bold !text-3xl !text-primary-main'>
                {value}
            </Text>
        </div>
    )
})

const Favorites = memo(function Favorites({ favorites, canEdit, parentId }) {
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
                <Text id ={DOMId + '-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
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