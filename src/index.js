import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
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
                    <div id = 'root' className = {theme + ' w-full h-full flex-col-reverse flex md:flex-row bg-base-main'}>
                        <Conditional value = {currentUser !== undefined}>
                            <Navigation currentUser = {currentUser} location = {location}/>
                            <div id = 'body' className = 'relative w-full h-full animate-slideInDown animate-duration-300'>
                                <TransitionGroup component = {null}>
                                    <CSSTransition 
                                        key = {location.pathname}
                                        classNames = {{
                                            enter: 'animate-slideInRight z-10',
                                            enterDone: 'animate-slideInRight z-10',
                                            exit: 'animate-slideOutRight -z-10',
                                            exitActive: 'animate-slideOutRight -z-10'
                                        }}
                                        timeout = {300}
                                        mountOnEnter
                                    >
                                        <Routes location = {location}/>
                                    </CSSTransition>
                                </TransitionGroup>
                            </div>
                        </Conditional>
                    </div>
                </DataProvider>
            </UserProvider>
        </WindowProvider>
    )
}