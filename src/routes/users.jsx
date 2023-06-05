import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'

export default function User() {
    const { user } = useRootContext()

    return (
        <div id = 'user-page' className = 'w-full h-full flex flex-col items-center justify-center gap-4'>
            <Helmet><title>users | betsy</title></Helmet>
        </div>
    )
}