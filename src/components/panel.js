import { memo, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { default as Icon } from './titleIcon'
import { useWindowContext } from '../contexts/window'
import Map from './map'

const Panel = memo(function Panel({ classes, children, parentId }) {
    let DOMId = parentId + '-panel'
    return (
        <div id = {DOMId} className = {'transition-colors duration-main w-full h-fit flex flex-col p-base gap-base bg-base-highlight rounded-base' + (classes ? ' ' + classes : '')}>
            {children}
        </div>
    )
}, (b, a) => b.classes === a.classes && _.isEqual(b.children, a.children))

export const MultiPanel = memo(function MultiPanel({ config, parentId, children }) {
    let [currentPanel, setCurrentPanel] = useState()
    let allPanels = useMemo(() => getSubpanels(config), [config])
    const { isLandscape } = useWindowContext()
    useEffect(() => {
        if (allPanels && !currentPanel) {
            setCurrentPanel(allPanels[0])
        }
    }, [allPanels])

    if (config) {
        if (isLandscape) {
            return (
                <>
                    {children}
                    <Map items = {config} callback = {(panel, panelIndex) => { 
                        if (panel.category === 'panel') {
                            return (
                                <Panel key = {panelIndex} title = {panel.title} icon = {panel.icon} classes = {panel.panelClasses} parentId = {panel.parentId}>
                                    {panel.children}
                                </Panel>
                            )
                        }
                        else if (panel.category === 'div') {
                            return (
                                <div key = {panelIndex} id = {panel.divId} className = {panel.divClasses}>
                                    <MultiPanel config = {panel.children} parentId = {panel.divId}/>
                                </div>
                            )
                        }
                        return null
                    }}/>
                </>
            )
        }
        else {
            if (currentPanel) {
                let DOMId = parentId + '-panels'
                return (
                    <>
                        {children}
                        <div id = {DOMId} className = 'transition-colors duration-main w-full h-fit flex flex-col p-base gap-base bg-base-highlight rounded-base'>
                            <div id = {DOMId + '-bar'} className = 'flex items-center gap-xs'>
                                <Map items = {allPanels} callback = {(panel, index) => { return (
                                    <div key = {index} id = {panel.parentId + '-title'} onClick = {() => setCurrentPanel(panel)}>
                                        <Icon icon = {panel.icon} classes = {'!h-8 !w-8 px-xs ' + (currentPanel.key !== panel.key ? '!text-text-highlight/killed hover:!text-primary-main cursor-pointer' : '')} parentId = {panel.parentId}/>
                                    </div>
                                )}}/>
                            </div>
                            {currentPanel.children}
                        </div>
                    </>
                )
            }
        }
    }
    return <></>

    function getSubpanels(nodes, result = []) {
        if (nodes) {
            for (var i = 0, length = nodes.length; i < length; i++) {
                if (nodes[i].category === 'panel') {
                    result.push(nodes[i])
                } else {
                    result = getSubpanels(nodes[i].children, result)
                }
            }
            return result
        }
        return null
    }
}, (b, a) => _.isEqual(b.config, a.config))

export default Panel