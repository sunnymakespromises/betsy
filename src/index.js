import React, { memo, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { WindowProvider } from './contexts/window'
import { UserProvider } from './contexts/user'
import { DataProvider } from './contexts/data'
import { useThemes } from './hooks/useThemes'
import { useBreakpoints } from './hooks/useBreakpoints'
import { useAuthorize } from './hooks/useAuthorize'
import { useData } from './hooks/useData'
import Navigation from './components/navigation'
import Conditional from './components/conditional'
import { Routes } from './routes/routes'
import './index.css'
import {default as SearchComponent} from './components/search'
import { AlarmRounded, AutoAwesomeRounded, FavoriteRounded, SortByAlphaRounded } from '@mui/icons-material'
import _ from 'lodash'
import { useCancelDetector } from './hooks/useCancelDetector'
import { useKeyListener } from './hooks/useKeyListener'

const rootElement = ReactDOM.createRoot(document.getElementById('root'))
rootElement.render(
    <GoogleOAuthProvider clientId = {process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}>
        <CookiesProvider>
            <BrowserRouter>
                <Root/>
            </BrowserRouter>
        </CookiesProvider>
    </GoogleOAuthProvider>
)

function Root() {
    const [sm, md, lg] = useBreakpoints()
    const isLandscape = !sm
    const location = useLocation()
    const theme = useThemes()
    const [currentUser, updateCurrentUser, login, logout] = useAuthorize()
    const { data, updateData } = useData(currentUser)
    const windowContext = { sm, md, lg, isLandscape }
    const userContext = { currentUser, updateCurrentUser, login, logout }
    const dataContext = { data, updateData }

    return (
        <WindowProvider value = {windowContext}>
            <UserProvider value = {userContext}>
                <DataProvider value = {dataContext}>
                    {(location.pathname === '/login' || data) &&
                    <div id = 'root' className = {theme + ' relative w-full h-full flex flex-col-reverse md:flex-row bg-base-main'}>
                        <Conditional value = {currentUser !== undefined}>
                            {currentUser && <Search currentUser = {currentUser} data = {data} />}
                            <Navigation currentUser = {currentUser} location = {location}/>
                            <div id = 'body' className = 'relative w-full h-full animate-slideInDown !animate-duration-150 overflow-auto no-scrollbar'>
                                <TransitionGroup component = {null}>
                                    <CSSTransition 
                                        key = {location.pathname}
                                        classNames = {{
                                            enter: '-z-10',
                                            enterDone: '-z-10',
                                            exit: 'z-10',
                                            exitActive: 'z-10'
                                        }}
                                        timeout = {100}
                                        mountOnEnter
                                    >
                                        <Routes location = {location}/>
                                    </CSSTransition>
                                </TransitionGroup>
                            </div>
                        </Conditional>
                    </div>}
                </DataProvider>
            </UserProvider>
        </WindowProvider>
    )
}

const Search = memo(function Search({ currentUser, data }) {
    const navigate = useNavigate()
    const searchConfig = useMemo(() => { return currentUser.favorites && {
        id: 'root',
        filters: {
            upcoming: {
                title: 'Upcoming Events',
                icon: (props) => <AlarmRounded {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events').sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical']
            },
            alphabetical: {
                title: 'Sort Alphabetically',
                icon: (props) => <SortByAlphaRounded {...props}/>,
                fn: (a,) => a.sort((a, b) => a.name.localeCompare(b.name)),
                turnsOff: ['popular']
            },
            favorites: {
                title: 'Favorites',
                icon: (props) => <FavoriteRounded {...props}/>,
                fn: (a, category) => a.filter(r => { 
                    if (category === 'events') {
                        return (currentUser.favorites.competitors.some(favoriteCompetitor => r.competitors.some(eventCompetitor => eventCompetitor.id === favoriteCompetitor.id)) || currentUser.favorites.competitions.some(favoriteCompetition => r.competition.id === favoriteCompetition.id) )
                    }
                    else {
                        return currentUser.favorites[category].some(favorite => favorite.id === r.id)
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
        space: {events: data.events, competitors: data.competitors, competitions: data.competitions},
        minimumLength: 3,
        categories: ['events', 'competitors', 'competitions'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'], competitions: ['name', 'sport.name', 'competitors.name']}
    }}, [data, currentUser.favorites])
    const [isVisible, setIsVisible] = useState()
    const cancelRef = useCancelDetector(() => isVisible ? setIsVisible(false) : null)
    useKeyListener(['CtrlKeyK'], () => setIsVisible(!isVisible))

    let DOMId = 'root'
    if (currentUser && data && isVisible) {
        return (
            <div id = {DOMId + 'search'} className = 'absolute top-0 left-0 w-full h-full flex justify-end z-30 p-main'>
                <div id = {DOMId + 'dimmer'} className = 'absolute top-0 left-0 transition-all duration-main w-full h-full bg-black/muted'/>
                <SearchComponent ref = {cancelRef} searchConfig = {searchConfig} onResultClick = {onResultClick} classes = 'relative md:!w-[50%]' dim = {false} parentId = {DOMId}/>
            </div>
        )
    }

    function onResultClick(category, result) {
        navigate('/info?category=' + category + '&id=' + result.id)
        setIsVisible(false)
    }
}, (b, a) => _.isEqual(b.currentUser, a.currentUser) && _.isEqual(b.data, a.data))