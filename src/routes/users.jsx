import { Outlet, useParams } from 'react-router-dom'
import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'

export default function User() {
    const { user } = useRootContext()
    const { username } = useParams()

    return (
        <div id = 'users-page' className = 'w-full h-full flex flex-col items-center justify-center gap-4'>
            <Helmet><title>users | betsy</title></Helmet>
            <Outlet/>
        </div>
    )
}