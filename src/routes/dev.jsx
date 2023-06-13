import { Helmet } from 'react-helmet'
import { DevProvider as Provider, useDevContext } from '../contexts/dev'
import Button from '../components/button'
import Image from '../components/image'
import Text from '../components/text'
import Page from '../components/page'

export default function Dev() {
    const context = { }

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'dev-page' className = 'w-full h-full flex flex-col items-center gap-4'>
                    <Helmet><title>Dev | Betsy</title></Helmet>
                </div>
            </Page>
        </Provider>
    )
}