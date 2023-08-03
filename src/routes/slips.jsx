import { memo } from 'react'
import Page from '../components/page'
import { Helmet } from 'react-helmet'
// import { useStore } from '../hooks/useStore'

const Slips = memo(function Slips() {
    // const { store, addToStore, removeFromStore } = useStore('slips')
    let DOMId = 'slips'
    return (
        <Page>
            <div id = {DOMId} className = 'w-full h-full flex flex-col'>
                <Helmet><title>Slips • Betsy</title></Helmet>
            </div>
        </Page>
    )
})

export default Slips