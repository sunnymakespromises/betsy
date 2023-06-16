import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { WindowProvider } from './contexts/window'
import { RootProvider } from './contexts/root'
import Header from './components/header'
import { useBreakpoints } from './hooks/useBreakpoints'
import { useAuthorize } from './hooks/useAuthorize'
import { useData } from './hooks/useData'
import { useThemes } from './hooks/useThemes'
import { Routes } from './routes/routes'
import './index.css'
import Image from './components/image'

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
    const location = useLocation()
    const navigate = useNavigate()
    const data = useData()
    const [searchParams, setSearchParams] = useSearchParams()
    const isDarkMode = useThemes()
    const [currentUser, refreshCurrentUser, login, logout] = useAuthorize()
    const windowContext = { sm, md, lg, isDarkMode, location, navigate, searchParams, setSearchParams }
    const rootContext = { currentUser, refreshCurrentUser, data, login, logout }

    return (
        <WindowProvider value = {windowContext}>
            <RootProvider value = {rootContext}>
                <Image id = 'bg' path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/bg.png'} classes = 'absolute top-0 left-0 w-full h-full bg-base-0 -z-10' mode = 'cover'/>
                <Header/>
                <div id = 'body' className = {(isDarkMode ? 'dark ' : '') + 'relative w-full h-full animate__animated animate__slideInUp'}>
                    <TransitionGroup component = {null}>
                        <CSSTransition 
                            key = {location.pathname}
                            classNames = {{
                                enter: location.pathname === '/' ? 'animate__slideInLeft' : 'animate__slideInRight',
                                enterDone: location.pathname === '/' ? 'animate__slideInLeft' : 'animate__slideInRight',
                                exit: location.pathname === '/' ? 'animate__slideOutLeft' : 'animate__slideOutRight',
                                exitActive: location.pathname === '/' ? 'animate__slideOutLeft' : 'animate__slideOutRight'
                            }}
                            timeout = {750}
                            mountOnEnter
                        >
                            <Routes location = {location}/>
                        </CSSTransition>
                    </TransitionGroup>
                </div>
            </RootProvider>
        </WindowProvider>
    )
}