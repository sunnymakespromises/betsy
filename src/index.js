import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { DndContext, useSensor, useSensors, KeyboardSensor, MouseSensor, TouchSensor, MeasuringStrategy, pointerWithin } from '@dnd-kit/core'
import { WindowProvider } from './contexts/window'
import { UserProvider } from './contexts/user'
import { DataProvider } from './contexts/data'
import { useThemes } from './hooks/useThemes'
import { useBreakpoints } from './hooks/useBreakpoints'
import { useAuthorize } from './hooks/useAuthorize'
import { useData } from './hooks/useData'
import Slips from './components/slips'
import { Routes } from './routes/routes'
import './index.css'
import Header from './components/header'

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
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        }
    })
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        }
    })
    const keyboardSensor = useSensor(KeyboardSensor)
    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
    )
    const hasUser = useMemo(() => currentUser !== undefined && currentUser !== null, [currentUser])

    return (
        <WindowProvider value = {windowContext}>
            <UserProvider value = {userContext}>
                <DataProvider value = {dataContext}>
                    <div id = 'body' className = {'theme-' + theme + ' transition-colors duration-main relative w-full h-full flex flex-col-reverse md:flex-row bg-base-main'}>
                        {(location.pathname === '/login' || data) && <>
                        {hasUser && data && <Header currentUser = {currentUser} data = {data} location = {location}/>}
                        <DndContext sensors = {sensors} autoScroll = {false} collisionDetection = {pointerWithin} measuring = {{droppable: {strategy: MeasuringStrategy.Always, frequency: 300}}}>
                            <div id = 'content' className = 'relative flex flex-col w-full h-full animate-fadeInDown'>
                                <TransitionGroup component = {null}>
                                    <CSSTransition 
                                        key = {location.pathname}
                                        classNames = {{
                                            enter: 'animate-slideInDown z-10',
                                            enterDone: 'animate-slideInDown',
                                            exit: 'animate-backOutUp z-0',
                                            exitActive: 'z-0'
                                        }}
                                        timeout = {300}
                                        mountOnEnter
                                    >
                                        <Routes location = {location}/>
                                    </CSSTransition>
                                </TransitionGroup>
                                {currentUser && <Slips slips = {currentUser.slips}/>}
                            </div>
                        </DndContext>
                        </>}
                    </div>
                </DataProvider>
            </UserProvider>
        </WindowProvider>
    )
}