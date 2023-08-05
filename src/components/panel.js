import { memo, useEffect, useState } from 'react'
import _ from 'lodash'
import Text from './text'
import { default as Icon } from './titleIcon'
import { useWindowContext } from '../contexts/window'
import Map from './map'

const Panel = memo(function Panel({ title, icon, classes, children, parentId }) {
    let DOMId = parentId + '-panel'
    return (
        <div id = {DOMId} className = {'transition-colors duration-main w-full h-fit flex flex-col p-base gap-base bg-base-highlight rounded-base' + (classes ? ' ' + classes : '')}>
            <div id = {DOMId + '-title'} className = 'flex items-center gap-sm'>
                <Icon icon = {icon} parentId = {DOMId}/>
                <Text id = {DOMId + '-title-text'} preset = 'title' classes = 'text-text-main'>
                    {title}
                </Text>
            </div>
            {children}
        </div>
    )
}, (b, a) => b.title === a.title && b.classes === a.classes && _.isEqual(b.icon, a.icon) && _.isEqual(b.children, a.children))

export const MultiPanel = memo(function MultiPanel({ config, parentId }) {
    let [currentPanel, setCurrentPanel] = useState()
    const { isLandscape } = useWindowContext()
    useEffect(() => {
        setCurrentPanel(config[0])
    }, [config])
    if (config) {
        if (isLandscape) {
            return (
                <Map items = {config} callback = {(panel, index) => { return (
                    <Panel key = {index} title = {panel.title} icon = {panel.icon} classes = {panel.panelClasses} parentId = {panel.parentId}>
                        {panel.children}
                    </Panel>
                )}}/>
            )
        }
        else {
            if (currentPanel) {
                let DOMId = parentId + '-panels'
                return (
                    <div id = {DOMId} className = 'transition-colors duration-main w-full h-fit flex flex-col p-base gap-base bg-base-highlight rounded-base'>
                        <div id = {DOMId + '-bar'} className = 'flex items-center gap-base'>
                            <Map items = {config} callback = {(panel, index) => { return (
                                <div key = {index} id = {panel.parentId + '-title'} onClick = {() => setCurrentPanel(panel)}>
                                    <Icon icon = {panel.icon} classes = {'!w-6 !h-6' + (currentPanel.key !== panel.key ? ' !text-text-highlight/killed hover:!text-primary-main cursor-pointer' : '')} parentId = {panel.parentId}/>
                                </div>
                            )}}/>
                        </div>
                        {currentPanel.children}
                    </div>
                )
            }
        }
    }
    return <></>
}, (b, a) => _.isEqual(b.config, a.config))

export default Panel