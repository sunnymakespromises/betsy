import Root from './root'
import Home from './home'
import Login from './login'
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
            }
        ]
    }
]

export default routes