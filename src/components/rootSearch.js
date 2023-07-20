import { memo, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import _ from 'lodash'
import { AlarmRounded, AutoAwesomeRounded, FavoriteRounded, ListAltRounded, SortByAlphaRounded } from '@mui/icons-material'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { useKeyListener } from '../hooks/useKeyListener'
import SearchWithResults from './searchWithResults'
import now from '../lib/util/now'

const RootSearch = memo(function RootSearch({ currentUser, data }) {
    const navigate = useNavigate()
    const searchConfig = useMemo(() => { return currentUser.favorites && {
        id: 'root',
        filters: {
            upcoming: {
                title: 'Upcoming Events',
                icon: (props) => <AlarmRounded {...props}/>,
                fn: (a) => a.filter(r => r.category === 'events' && r.item.start_time < (now() + (60*60*24*7))).sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical']
            },
            has_bets: {
                title: 'Has Bets',
                icon: (props) => <ListAltRounded {...props}/>,
                fn: (a) => a.filter(r => r.category === 'events' && r.item.bets && r.item.bets.length > 0).sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical']
            },
            alphabetical: {
                title: 'Sort Alphabetically',
                icon: (props) => <SortByAlphaRounded {...props}/>,
                fn: (a) => a.sort((a, b) => a.item.name.localeCompare(b.item.name)),
                turnsOff: ['popular']
            },
            favorites: {
                title: 'Favorites',
                icon: (props) => <FavoriteRounded {...props}/>,
                fn: (a) => a.filter(r => { 
                    if (r.category === 'events') {
                        return (currentUser.favorites.competitors.some(favoriteCompetitor => r.item.competitors.some(eventCompetitor => eventCompetitor.id === favoriteCompetitor.id)) || currentUser.favorites.competitions.some(favoriteCompetition => r.item.competition.id === favoriteCompetition.id) )
                    }
                    else {
                        return currentUser.favorites[r.category].some(favorite => favorite.id === r.item.id)
                    }
                })
            },
            popular: {
                title: 'Popular',
                icon: (props) => <AutoAwesomeRounded {...props}/>,
                fn: (a,) => a.sort((a, b) => a.slip_count - b.slip_count),
                turnsOff: ['alphabetical']
            }
        },
        space: { competitors: data.competitors, competitions: data.competitions, events: data.events},
        minimumLength: 3,
        shape: 'array',
        categories: ['competitors', 'competitions', 'events'],
        keys: { competitors: [{name: 'name', weight: '2'}, 'competitions.name', 'sport.name'], competitions: [{name: 'name', weight: '2'}, 'sport.name', 'competitors.name'], events: ['name', 'competition.name', 'competitors.name', 'sport.name'] }
    }}, [data, currentUser.favorites])
    const [isVisible, setIsVisible] = useState(false)
    const cancelRef = useCancelDetector(() => isVisible && setIsVisible(false))
    useKeyListener(['CtrlKeyK'], () => setIsVisible(!isVisible))

    let DOMId = 'root'
    if (currentUser && data && isVisible) {
        return (
            <div id = {DOMId + '-search'} className = {'absolute top-0 right-0 w-full flex p-main z-50'}>
                <div id = {DOMId + '-dimmer'} className = {'absolute top-0 left-0 transition-all duration-main w-screen h-screen bg-black/muted !animate-duration-150 animate-fadeIn'}/>
                <SearchWithResults ref = {cancelRef} searchConfig = {searchConfig} container = {'lol'} onResultClick = {onResultClick} autoFocus classes = {'w-full md:!w-[50%] !animate-duration-150 animate-slideInDown'} parentId = {DOMId}/>
            </div>
        )
    }

    function onResultClick(category, result) {
        navigate('/info?category=' + category + '&id=' + result.id)
        setIsVisible(false)
    }
}, (b, a) => _.isEqual(b.currentUser, a.currentUser) && _.isEqual(b.data, a.data))

export default RootSearch