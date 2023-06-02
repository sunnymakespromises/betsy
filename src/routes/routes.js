import Root from './root'
import Home from './home'
import ErrorPage from '../errorPage'

const routes = [
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            
        ]
    }
]

export default routes