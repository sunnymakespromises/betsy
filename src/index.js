import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { SyncLoader } from 'react-spinners'
import { WindowProvider } from './contexts/window'
import { UserProvider } from './contexts/user'
import { DataProvider } from './contexts/data'
import { useThemes } from './hooks/useThemes'
import { useBreakpoints } from './hooks/useBreakpoints'
import { useAuthorize } from './hooks/useAuthorize'
import { useData } from './hooks/useData'
import { Routes } from './routes/routes'
import Header from './components/header'
import './index.css'

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
    const { data, updateData, isLoading } = useData(currentUser)
    const windowContext = { sm, md, lg, isLandscape }
    const userContext = { currentUser, updateCurrentUser, login, logout }
    const dataContext = { data, updateData }
    const hasUser = useMemo(() => currentUser !== undefined && currentUser !== null, [currentUser])

    return (
        <WindowProvider value = {windowContext}>
            <UserProvider value = {userContext}>
                <DataProvider value = {dataContext}>
                    <div id = 'body' className = {'theme-' + theme + ' transition-colors duration-main relative w-full h-full flex flex-col md:flex-row bg-base-main overflow-auto'}>
                        <SyncLoader
                            size = {10}
                            color = {'#B0BEC5'}
                            loading = {true}
                            aria-label = 'Loading Spinner'
                            data-testid = 'loader'
                            className = {'translate-opacity duration-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ' + (isLoading ? 'opacity-100' : 'opacity-0')}
                        />
                        {(!isLoading && (location.pathname === '/login' || data)) && <>
                            {hasUser && data && <Header currentUser = {currentUser} data = {data} location = {location}/>}
                            <div id = 'content' className = 'relative flex flex-col w-full h-full animate-fadeInUp'>
                                <TransitionGroup component = {null}>
                                    <CSSTransition 
                                        key = {location.pathname}
                                        classNames = {{
                                            enter: 'animate-slideInRight z-10',
                                            enterDone: 'animate-slideInRight',
                                            exit: 'animate-fadeOutLeft z-0',
                                            exitActive: 'z-0'
                                        }}
                                        timeout = {300}
                                        mountOnEnter
                                    >
                                        <Routes location = {location}/>
                                    </CSSTransition>
                                </TransitionGroup>
                            </div>
                        </>}
                    </div>
                </DataProvider>
            </UserProvider>
        </WindowProvider>
    )
}