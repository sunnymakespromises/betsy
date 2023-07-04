import { memo, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useNavigate } from 'react-router-dom'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import Page from '../components/page'
import {default as SearchComponent} from '../components/search'
import { AutoAwesomeRounded, FavoriteRounded, SortByAlphaRounded } from '@mui/icons-material'
import { useUserContext } from '../contexts/user'
import Text from '../components/text'
import toDate from '../lib/util/toDate'
import Profile from '../components/profile'
import List from '../components/list'

const Home = memo(function Home() {
    let navigate = useNavigate()
    const { currentUser } = useUserContext()
    const { data } = useDataContext()

    let DOMId = 'home-'
    return (
        <Page>
            <div id = {DOMId + 'page'} className = 'w-full h-full'>
                <Helmet><title>Dashboard | Betsy</title></Helmet>
                <Search data = {data} currentUser = {currentUser} navigate = {navigate} parentId = {DOMId}>
                    <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col md:flex-row gap-small md:gap-main z-0 mt-small md:mt-small overflow-hidden'>
                        <div id = {DOMId + 'group-3-container'} className = 'w-min h-full flex flex-col gap-smaller'>
                            <Profile parentId = {DOMId} canEdit = {false}/>
                        </div>
                        <div id = {DOMId + 'group-2-container'} className = 'grow flex flex-col'>
                        </div>
                        <div id = {DOMId + 'group-1-container'} className = 'w-full md:w-min h-[50%] md:h-full flex flex-col gap-smaller'>
                            <Events events = {data?.recommendations?.events} navigate = {navigate} parentId = {DOMId}/>
                        </div>
                    </div>
                </Search>
            </div>
        </Page>
    )
})

const Search = memo(function Search({ data, currentUser, navigate, parentId, children }) {
    const searchConfig = useMemo(() => { return currentUser?.favorites && {
        filters: {
            alphabetical: {
                title: 'Sort Alphabetically',
                icon: (props) => <SortByAlphaRounded {...props}/>,
                fn: (a) => a.sort((a, b) => a.item.name.localeCompare(b.item.name)),
                turnsOff: ['popular']
            },
            favorites: {
                title: 'Favorites',
                icon: (props) => <FavoriteRounded {...props}/>,
                fn: (a) => a.filter(r => r.category === 'events' ? (currentUser.favorites?.competitors?.some(favoriteCompetitor => r.item.competitors.some(eventCompetitor => eventCompetitor.id === favoriteCompetitor.id)) || currentUser.favorites?.competitions?.some(favoriteCompetition => r.item.competition.id === favoriteCompetition.id) ) : currentUser.favorites[r.category]?.some(favorite => favorite.id === r.item.id))
            },
            popular: {
                title: 'Popular',
                icon: (props) => <AutoAwesomeRounded {...props}/>,
                fn: (a) => a.sort((a, b) => a.slip_count - b.slip_count),
                turnsOff: ['alphabetical']
            }
        },
        categories: ['events', 'competitors', 'competitions'],
        spaces: null,
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'], competitions: ['name', 'sport.name', 'competitors.name']},
        minimumLength: 3
    }}, [currentUser.favorites])

    if (data && currentUser) {
        return (
            <SearchComponent favorites = {currentUser.favorites} searchConfig = {searchConfig} data = {data ? {events: data.events, competitors: data.competitors, competitions: data.competitions} : null} onResultClick = {onResultClick} parentId = {parentId}>
                {children}
            </SearchComponent>
        )
    }

    function onResultClick(category, result) {
        navigate('/info?category=' + category + '&id=' + result.id)
    }
}, (b, a) => _.isEqual(b.data, a.data) && _.isEqual(b.currentUser, a.currentUser) && b.children === a.children)

const Events = memo(function Events({ events, navigate, parentId }) {
    const Item = memo(function Item({ item, parentId }) {
        const isLive = useMemo(() => item.group === 'live', [item])
        const textColor = useMemo(() => {return {main: isLive ? 'text-primary-main' : 'text-text-main', muted: isLive ? 'text-primary-main/muted' : 'text-text-main/muted', killed: isLive ? 'text-primary-main/muted' : 'text-text-main/muted'} }, [isLive])
        return (
            <Link to = {'/info?category=events&id=' + item.id} id = {parentId + 'info'} className = {'group/event w-full h-full'}>
                <Text id = {parentId + 'date'} preset = 'home-events-date'>
                    {toDate(item.start_time)}
                </Text>
                <Text id = {parentId + 'name'} preset = 'home-events-name' classes = {'-mt-micro ' + textColor.main}>
                    {item.name}
                </Text>
                <div id = {parentId + 'subtitle-container'} className = 'flex flex-row'>
                    <Text id = {parentId + 'competition'} preset = 'home-events-competition'>
                        {item.competition.name}&nbsp;
                    </Text>
                    <Text id = {parentId + 'sport'} preset = 'home-events-sport'>
                        {item.sport.name}
                    </Text>
                </div>
            </Link>
        )
    }, (b, a) => _.isEqual(b.item, a.item))

    let DOMId = parentId + 'events-'
    if (events) {
        return (
            <List items = {events} element = {Item} parentId = {DOMId}/>
        )
    }
}, (b, a) => _.isEqual(b.events, a.events))

export default Home