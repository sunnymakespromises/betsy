import React from 'react'
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
import Navigation from './components/navigation'
import Conditional from './components/conditional'
import RootSearch from './components/rootSearch'
import Slips from './components/slips'
import { Routes } from './routes/routes'
import './index.css'
import 'simplebar-react/dist/simplebar.min.css'

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

    return (
        <WindowProvider value = {windowContext}>
            <UserProvider value = {userContext}>
                <DataProvider value = {dataContext}>
                    <div id = 'lol' className = {theme + ' relative w-full h-full flex flex-col-reverse md:flex-row bg-base-main'}>
                    {(location.pathname === '/login' || data) &&
                        <Conditional value = {currentUser !== undefined}>
                            {currentUser && <RootSearch currentUser = {currentUser} data = {data}/>}
                            <Navigation currentUser = {currentUser} location = {location}/>
                            <DndContext sensors = {sensors} autoScroll = {false} collisionDetection = {pointerWithin} measuring = {{droppable: {strategy: MeasuringStrategy.Always, frequency: 300}}}>
                                <div id = 'body' className = 'relative w-full h-full flex flex-col overflow-hidden'>
                                    <TransitionGroup component = {null}>
                                        <CSSTransition 
                                            key = {location.pathname}
                                            classNames = {{
                                                enter: 'z-0',
                                                enterDone: '',
                                                exit: 'z-10',
                                                exitActive: 'z-10'
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
                        </Conditional>}
                    </div>
                </DataProvider>
            </UserProvider>
        </WindowProvider>
    )
}