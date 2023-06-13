import { Helmet } from 'react-helmet'
import { DevProvider as Provider, useDevContext } from '../contexts/dev'
import { useApi } from '../hooks/useApi'
import Button from '../components/button'
import Image from '../components/image'
import Text from '../components/text'
import Page from '../components/page'

export default function Dev() {
    const { initializeApiData } = useApi()
    const context = { }

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'dev-page' className = 'w-full h-full flex flex-col gap-4'>
                    <Helmet><title>Dev | Betsy</title></Helmet>
                    <Button onClick = {() => initializeApiData()}>
                        <Text>
                            initialize
                        </Text>
                    </Button>
                </div>
            </Page>
        </Provider>
    )
}