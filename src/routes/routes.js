import Root from './root'
import Home from './home'
import Login from './login'
import User from './user'
import Users from './users'
import ErrorPage from '../errorPage'
import Profile from './profile'

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
                path: '/login',
                element: <Login />
            },
            {
                path: '/profile',
                element: <Profile />
            },
            {
                path: '/users',
                element: <Users />
            },
            {
                path: '/users/:username',
                element: <User />
            }
        ]
    }
]

export default routes