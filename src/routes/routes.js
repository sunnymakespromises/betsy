import { Routes as RoutesWrapper, Route } from 'react-router-dom'
import { BoxArrowRight, ClipboardDataFill, CloudFill, FileTextFill, GearFill, HouseFill, KeyFill, PersonCircle, PostcardFill } from 'react-bootstrap-icons'
import Home from './home'
import Settings from './settings'
import Login from './login'
import Logout from './logout'
import User from './user'
import Info from './info'
import Slips from './slips'
import Edit from './edit'
import Database from './database'

const routes = [
    {
        path: '/',
        title: 'Home',
        icon: (props) => <HouseFill {...props}/>,
        element: <Home/>,
        show: true,
        is_dev: false
    },
    {
        path: '/login',
        title: 'Login',
        icon: (props) => <KeyFill {...props}/>,
        element: <Login/>,
        show: false,
        is_dev: false,
    },
    {
        path: '/info',
        title: 'Info',
        icon: (props) => <PostcardFill {...props}/>,
        element: <Info/>,
        show: false,
        is_dev: false
    },
    {
        path: '/slips',
        title: 'Slips',
        icon: (props) => <FileTextFill {...props}/>,
        element: <Slips/>,
        show: true,
        is_dev: false
    },
    {
        path: '/database',
        title: 'Database',
        icon: (props) => <ClipboardDataFill {...props}/>,
        element: <Database/>,
        show: true,
        is_dev: true
    },
    {
        path: '/edit',
        title: 'Edit',
        icon: (props) => <CloudFill {...props}/>,
        element: <Edit/>,
        show: true,
        is_dev: true
    },
    {
        path: '/user',
        title: 'User',
        icon: (props) => <PersonCircle {...props}/>,
        element: <User/>,
        show: true,
        is_dev: false
    },
    {
        path: '/settings',
        title: 'Settings',
        icon: (props) => <GearFill {...props}/>,
        element: <Settings/>,
        show: true,
        is_dev: false
    },
    {
        path: '/logout',
        title: 'Logout',
        icon: (props) => <BoxArrowRight {...props}/>,
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