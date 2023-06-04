import Page from '../components/page'
import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'

export default function Home() {
    const { user } = useRootContext()

    return (
        <div className = 'w-full h-full'>
            <Helmet>
                <title>dashboard | betsy</title>
            </Helmet>
        </div>
    )
}