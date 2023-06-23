import { Routes as RoutesWrapper, Route } from 'react-router-dom'
import Home from './home'
import Settings from './settings'
import Login from './login'
import Logout from './logout'
import Explore from './explore'
import User from './user'
import Wallet from './wallet'
import Dev from './dev/dev'
import Images from './dev/images'

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
    },
    {
        path: '/dev',
        title: 'Dev',
        element: <Dev/>,
        navigation: {
            show: false
        },
        children: [
            {
                path: '/dev/images',
                title: 'Images',
                element: <Images/>,
                navigation: {
                    show: false
                }
            }
        ]
    }
]

const Routes = ({location}) => {
    return (
        <RoutesWrapper location = {location}>
            {pages.map((page, pageIndex) => {
                return (
                    <Route key = {pageIndex} path = {page.path} element = {page.element}>
                        {page.children ? page.children.map((child, childIndex) => {
                            return (
                                <Route key = {childIndex} path = {child.path} element = {child.element}/>
                            )
                        }):null}
                    </Route>
                )
            })}
        </RoutesWrapper>
    )
}

export { Routes, pages }