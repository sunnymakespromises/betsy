import { Routes as RoutesWrapper, Route } from 'react-router-dom'
import Home from './home'
import Settings from './settings'
import Login from './login'
import Logout from './logout'
import User from './user'
import Dev from './dev'
import Info from './info'
import Slips from './slips'
import { ExitToApp, DevicesRounded, DashboardRounded, VpnKeyRounded, AccountCircleRounded, SettingsRounded, ContactsRounded, ListAltRounded } from '@mui/icons-material'

const routes = [
    {
        path: '/',
        icon: (props) => <DashboardRounded {...props}/>,
        element: <Home/>,
        show: true,
        is_dev: false
    },
    {
        path: '/login',
        icon: (props) => <VpnKeyRounded {...props}/>,
        element: <Login/>,
        show: false,
        is_dev: false
    },
    {
        path: '/info',
        icon: (props) => <ContactsRounded {...props}/>,
        element: <Info/>,
        show: false,
        is_dev: false
    },
    {
        path: '/slips',
        icon: (props) => <ListAltRounded {...props}/>,
        element: <Slips/>,
        show: true,
        is_dev: false
    },
    {
        path: '/dev',
        icon: (props) => <DevicesRounded {...props}/>,
        element: <Dev/>,
        show: true,
        is_dev: true
    },
    {
        path: '/user',
        icon: (props) => <AccountCircleRounded {...props}/>,
        element: <User/>,
        show: true,
        is_dev: false
    },
    {
        path: '/settings',
        icon: (props) => <SettingsRounded {...props}/>,
        element: <Settings/>,
        show: true,
        is_dev: false
    },
    {
        path: '/logout',
        icon: (props) => <ExitToApp {...props}/>,
        element: <Logout/>,
        show: false,
        is_dev: false
    }
]

const Routes = ({location}) => {
    return (
        <RoutesWrapper location = {location}>
            {routes.map((route, routeIndex) => { return (
                <Route key = {routeIndex} path = {route.path} element = {route.element}>
                    {route.children && route.children.map((child, childIndex) => { return (
                        <Route key = {childIndex} path = {child.path} element = {child.element}/>
                    )})}
                </Route>
            )})}
        </RoutesWrapper>
    )
}

export { Routes, routes }