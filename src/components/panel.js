import React, { memo, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
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

const Icon = memo(function Icon({ icon, classes, parentId }) {
    let DOMId = parentId
    let Icon = icon ? icon : null
    
    return (
        icon && <Icon id = {DOMId + '-icon'} className = {'transition-colors duration-main h-4 aspect-square text-primary-main' + (classes ? ' ' + classes : '')}/>
    )
}, (b, a) => b.classes === a.classes && _.isEqual(b.icon, a.icon))

export const MultiPanel = memo(function MultiPanel({ config, parentId, children }) {
    let [currentPanel, setCurrentPanel] = useState()
    let panels = useMemo(() => getPanels(config), [config])
    let displayPanels = useMemo(() => getDisplayPanels(config), [config])
    const { isLandscape } = useWindowContext()
    useEffect(() => {
        if (panels && !currentPanel) {
            setCurrentPanel(panels[0])
        }
    }, [panels])

    if (config) {
        if (isLandscape) {
            return (
                <>
                    {children}
                    <Map items = {config} callback = {(panel, panelIndex) => { 
                        if (panel.category === 'panel') {
                            return (
                                <Panel key = {panelIndex} icon = {panel.icon} classes = {panel.panelClasses} parentId = {panel.parentId}>
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
                        else if (panel.category === 'display') {
                            return (
                                <React.Fragment key = {panelIndex}>
                                    {panel.children}
                                </React.Fragment>
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
                        <Map items = {displayPanels} callback = {(panel, index) => { return (
                            <React.Fragment key = {index}>
                                {panel.children}
                            </React.Fragment>
                        )}}/>
                        <div id = {DOMId} className = 'transition-colors duration-main w-full h-fit flex flex-col p-base gap-base bg-base-highlight rounded-base'>
                            <div id = {DOMId + '-bar'} className = 'flex items-center gap-xs'>
                                <Map items = {panels} callback = {(panel, index) => { return (
                                    <div key = {index} id = {panel.parentId + '-title'} onClick = {() => setCurrentPanel(panel)}>
                                        <Icon icon = {panel.icon} classes = {'w-8 h-8 px-xs ' + (currentPanel.key !== panel.key ? '!text-text-highlight/killed hover:!text-primary-main cursor-pointer' : '')} parentId = {panel.parentId}/>
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

    function getPanels(nodes, result = []) {
        if (nodes) {
            for (var i = 0, length = nodes.length; i < length; i++) {
                if (nodes[i].category === 'panel') {
                    result.push(nodes[i])
                } else if (nodes[i].category === 'div') {
                    result = getPanels(nodes[i].children, result)
                }
            }
            return result
        }
        return null
    }

    function getDisplayPanels(nodes, result = []) {
        if (nodes) {
            for (var i = 0, length = nodes.length; i < length; i++) {
                if (nodes[i].category === 'display') {
                    result.push(nodes[i])
                } else if (nodes[i].category === 'div') {
                    result = getDisplayPanels(nodes[i].children, result)
                }
            }
            return result
        }
        return null
    }
}, (b, a) => _.isEqual(b.config, a.config))

export default Panel