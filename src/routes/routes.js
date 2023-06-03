import Root from './root'
import Home from './home'
import Login from './login'
import ErrorPage from '../errorPage'
import Settings from './settings'

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
                path: '/settings',
                element: <Settings />
            }
        ]
    }
]

export default routes