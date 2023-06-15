import { Helmet } from 'react-helmet'
import { useApi } from '../hooks/useApi'
import Button from '../components/button'
import Text from '../components/text'
import Page from '../components/page'

export default function Dev() {
    const { initializeApiData } = useApi()

    return (
        <Page>
            <div id = 'dev-page' className = 'w-full h-full flex flex-col'>
                <Helmet><title>Dev | Betsy</title></Helmet>
                <Button onClick = {() => initializeApiData()}>
                    <Text>
                        initialize
                    </Text>
                </Button>
            </div>
        </Page>
    )
}