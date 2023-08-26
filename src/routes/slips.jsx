import React, { memo } from 'react'
import { Helmet } from 'react-helmet'
import { FileTextFill } from 'react-bootstrap-icons'
import Page from '../components/page'
import Panel from '../components/panel'
import { Slips as SlipsDisplay } from '../components/slips'

const Slips = memo(function Slips() {
    let DOMId = 'slips'
    return (
        <Page canScroll parentId = {DOMId}>
            <Helmet><title>Slips • Betsy</title></Helmet>
            <div id = {DOMId} className = 'w-full h-full flex flex-col md:flex-row'>
                <Panel title = 'Slips' icon = {FileTextFill} parentId = {DOMId}>
                    <SlipsDisplay editable parentId = {DOMId} />
                </Panel>
            </div>
        </Page>
    )
})

export default Slips