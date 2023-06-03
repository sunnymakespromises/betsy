import { useRouteError } from 'react-router-dom'
import Text from './components/text'

export default function ErrorPage() {
    const error = useRouteError()
    console.error(error)

    return (
        <div id = 'error-page'>
            <Text>OOPS</Text>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    )
}