import { Routes as RoutesWrapper, Route } from 'react-router-dom'
import Home from './home'
import Settings from './settings'
import Login from './login'
import Logout from './logout'
import Explore from './explore'
import User from './user'
import Wallet from './wallet'

const pages = [
    {
        path: '/',
        title: 'Home',
        element: <Home/>,
        navigation: {
            show: false
        }
    },
    {
        path: '/login',
        title: 'Login',
        element: <Login/>,
        navigation: {
            show: false
        }
    },
    {
        path: '/explore',
        title: 'Explore',
        element: <Explore/>,
        navigation: {
            show: true,
            index: 0
        }
    },
    {
        path: '/user',
        title: 'User',
        element: <User/>,
        navigation: {
            show: false
        }
    },
    {
        path: '/settings',
        title: 'Settings',
        element: <Settings/>,
        navigation: {
            show: false
        }
    },
    {
        path: '/logout',
        title: 'Logout',
        element: <Logout/>,
        navigation: {
            show: false
        }
    },
    {
        path: '/wallet',
        title: 'Wallet',
        element: <Wallet/>,
        navigation: {
            show: false
        }
    }
]

const Routes = ({location}) => {
    return (
        <RoutesWrapper location = {location}>
            {pages.map((page, index) => {
                return (
                    <Route key = {index} path = {page.path} element = {page.element}/>
                )
            })}
        </RoutesWrapper>
    )
}

export { Routes, pages }