import Root from './root'
import Home from './home'
import Settings from './settings'
import Login from './login'
import Users from './users'
import ErrorPage from '../errorPage'

const routes = [
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/home',
                element: <Home />
            },
            {
                path: '/settings',
                element: <Settings />
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/users',
                element: <Users />
            }
        ]
    }
]

export default routes