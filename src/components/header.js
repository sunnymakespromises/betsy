import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { routes } from '../routes/routes'
import Map from './map'
import Text from './text'
import { CalendarWeekFill, HeartFill, PeopleFill, Search, SortAlphaDown, Stack, Stars, StopwatchFill, TrophyFill } from 'react-bootstrap-icons'
import now from '../lib/util/now'
import SearchWithResults from './searchWithResults'
// import Image from './image'
// import { useFavorite } from '../hooks/useFavorite'

const Header = memo(function Header({ currentUser, data, location }) {
    let [searchIsExpanded, setSearchIsExpanded] = useState(false)
    const searchConfig = useMemo(() => { return currentUser.favorites && {
        id: 'search',
        filters: {
            upcoming: {
                title: 'Upcoming Events',
                icon: (props) => <StopwatchFill {...props}/>,
                fn: (a) => a.filter(r => r.category === 'events' && !r.item.is_completed && r.item.start_time < (now() + (60*60*24*7))).sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical', 'competitions', 'competitors']
            },
            has_bets: {
                title: 'Has Bets',
                icon: (props) => <Stack {...props}/>,
                fn: (a) => a.filter(r => r.category === 'events' && !r.item.is_completed && r.item.bets.length > 0).sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical', 'competitions', 'competitors']
            },
            alphabetical: {
                title: 'Sort Alphabetically',
                icon: (props) => <SortAlphaDown {...props}/>,
                fn: (a) => a.sort((a, b) => a.item.name.localeCompare(b.item.name)),
                turnsOff: ['popular']
            },
            favorites: {
                title: 'Favorites',
                icon: (props) => <HeartFill {...props}/>,
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
                icon: (props) => <Stars {...props}/>,
                fn: (a,) => a.sort((a, b) => a.slip_count - b.slip_count),
                turnsOff: ['alphabetical']
            },
            competitions: {
                title: 'Competitions',
                icon: (props) => <TrophyFill {...props}/>,
                fn: (a) => a.filter(r => r.category === 'competitions'),
                turnsOff: ['has_bets', 'upcoming', 'competitors', 'events']
            },
            competitors: {
                title: 'Competitors',
                icon: (props) => <PeopleFill {...props}/>,
                fn: (a) => a.filter(r => r.category === 'competitors'),
                turnsOff: ['has_bets', 'upcoming', 'competitions', 'events']
            },
            events: {
                title: 'Events',
                icon: (props) => <CalendarWeekFill {...props}/>,
                fn: (a) => a.filter(r => r.category === 'events'),
                turnsOff: ['competitions', 'competitors']
            }
        },
        space: { competitors: data.competitors, competitions: data.competitions, events: data.events.filter(event => !event.is_completed), users: data.users},
        minimumLength: 3,
        shape: 'array',
        categories: ['competitors', 'competitions', 'events', 'users'],
        keys: { competitors: [{name: 'name', weight: '2'}, 'competitions.name', 'sport.name'], competitions: [{name: 'name', weight: '2'}, 'sport.name', 'competitors.name'], events: ['name', 'competition.name', 'competitors.name', 'sport.name'], users: ['display_name'] }
    }}, [data, currentUser.favorites])

    let DOMId = 'header'
    if (currentUser) {
        return (
            <header id = {DOMId} className = {'w-full h-min md:w-[24rem] md:h-full p-base md:p-lg z-20 animate-fadeInLeft'}>
                <div id = {DOMId + '-container'} className = 'transition-colors duration-main w-full h-min flex flex-col-reverse md:flex-col p-base gap-base bg-base-highlight rounded-base'>
                    <SearchWithResults searchConfig = {searchConfig} classes = {(searchIsExpanded ? '' : 'hidden md:flex')} closeOnClick showFavorites container = 'content' parentId = {DOMId}/>
                    <div id = {DOMId + '-pages'} className = 'w-full h-full flex md:flex-col gap-base'>
                        <Map items = {routes.filter(route => route.show && (route.is_dev ? currentUser.is_dev : true))} callback = {(page, index) => {
                            let isCurrent = '/' + location.pathname.split('/')[1] === page.path.split('?')[0]
                            let iconId = DOMId + '-page' + index; return (
                            <LinkPage key = {index} path = {page.path} title = {page.title} icon = {page.icon} isCurrent = {isCurrent} parentId = {iconId} />
                        )}}/>
                        <ButtonPage title = 'Search' icon = {Search} isCurrent = {searchIsExpanded} classes = 'md:!hidden' onClick = {() => setSearchIsExpanded(!searchIsExpanded)} parentId = {DOMId + '-search'}/>
                    </div>
                </div>
            </header>
        )
    }
}, (b, a) => b.location.pathname === a.location.pathname && b.location.search === a.location.search && _.isEqual(b.currentUser, a.currentUser) && _.isEqual(b.data, a.data))

const LinkPage = memo(function LinkPage({ path, title, icon, isCurrent, parentId }) {
    const Icon = icon
    let DOMId = parentId
    return (
        <Link id = {DOMId} to = {path} className = {'group/icon w-6 md:w-auto h-6 md:h-auto flex items-center gap-xs cursor-pointer'}>
            <Icon id = {DOMId + '-icon'} title = {title} className = {'transition-colors duration-main h-full w-full md:w-min aspect-square ' + (isCurrent ? 'text-primary-main' : 'text-text-highlight/killed group-hover/icon:text-primary-main')}/>
            <Text preset = 'body' classes = {'hidden md:flex transition-colors duration-main ' + (isCurrent ? 'text-primary-main' : 'text-text-highlight/killed group-hover/icon:text-primary-main')}>
                {title}
            </Text>
        </Link>
    )
}, (b, a) => b.path === a.path && b.title === a.title && b.isCurrent === a.isCurrent)

const ButtonPage = memo(function ButtonPage({ title, icon, isCurrent, classes, onClick, parentId }) {
    const Icon = icon
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'group/icon w-6 md:w-auto h-6 md:h-auto flex items-center gap-xs cursor-pointer' + (classes ? ' ' + classes : '')} onClick = {onClick}>
            <Icon id = {DOMId + '-icon'} title = {title} className = {'transition-colors duration-main h-full w-full md:w-min aspect-square ' + (isCurrent ? 'text-primary-main' : 'text-text-highlight/killed group-hover/icon:text-primary-main')}/>
            <Text preset = 'body' classes = {'hidden md:flex transition-colors duration-main ' + (isCurrent ? 'text-primary-main' : 'text-text-highlight group-hover/icon:text-primary-main')}>
                {title}
            </Text>
        </div>
    )
}, (b, a) => b.title === a.title && b.isCurrent === a.isCurrent && b.classes === a.classes)

export default Header