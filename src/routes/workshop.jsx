import React, { memo } from 'react'
import { Helmet } from 'react-helmet'
import Page from '../components/page'
import { default as SlipsDisplay } from '../components/slips'
import { useStore } from '../hooks/useStore'
import Panel from '../components/panel'

const Workshop = memo(function Slips() {
    let DOMId = 'slips'
    let [ compressedSlips, , , , ] = useStore('user_slips', 'array')
    
    return (
        <Page canScroll parentId = {DOMId}>
            <Helmet><title>Workshop • Betsy</title></Helmet>
            <div id = {DOMId} className = 'w-full h-full flex flex-col gap-base'>
                <Panel parentId = {DOMId}>
                    <SlipsDisplay compressedSlips = {compressedSlips} isEditable parentId = {DOMId} />
                </Panel>
            </div>
        </Page>
    )
})

export default Workshop