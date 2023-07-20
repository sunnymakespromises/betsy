import { forwardRef, memo, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { Droppable } from './drag'
import Map from './map'
import Text from './text'
import { AddCircleRounded } from '@mui/icons-material'
import { useStore } from '../hooks/useStore'
import { useDndMonitor } from '@dnd-kit/core'

const Slips = memo(function Slips() {
    const [active, setActive] = useState()
    const isDragging = useMemo(() => active, [active])
    let [ trays, addSlip, removeSlip ] = useStore('user_slips', 'array')
    useDndMonitor({
        onDragStart: (item) => setActive(item.active.data.current),
        onDragEnd: () => setActive(null)
    })

    let DOMId = 'slips'
    if (active !== undefined) {
        return (
            <div id = {DOMId} className = {'absolute bottom-0 right-0 mb-main mr-main transition-transform duration-main w-[28rem] min-h max-h-full flex flex-col bg-base-main rounded-main border-thin border-divider-main shadow-sm md:shadow overflow-auto no-scrollbar !animate-duration-150 ' + (isDragging ? 'animate-slideInRight' : 'animate-slideOutRight')}>
                <div id = {DOMId + '-bar'} className = 'p-main backdrop-blur-main border-b-thin border-divider-main'>
                    <Text id = {DOMId + '-title'} preset = 'main-title'>
                        Slips
                    </Text>
                </div>
                <div id = {DOMId + '-trays'} className = 'w-full h-full flex flex-col p-main'>
                    <Map array = {trays} callback = {(tray, index) => {
                        let trayId = DOMId + '-tray' + index; return (
                        <Droppable id = {'root-' + index}>
                            <Tray key = {index} picks = {tray.picks} parentId = {trayId}/>
                        </Droppable>
                    )}}/>
                    <Droppable id = 'root-new'>
                        <NewTray parentId = {DOMId}/>
                    </Droppable>
                </div>
            </div>
        )
    }
})

const Tray = memo(forwardRef(function Tray({ picks, parentId, active, isOver }, dropRef) {
    useEffect(() => {
        if (active) {
            console.log(active)
        }
    }, [active])

    let DOMId = parentId + '-tray'
    return (
        <div id = {DOMId} className = {'transition-colors duration-main w-full rounded-main border-thin border-divider-main' + (isOver === true ? ' !bg-primary-main' : '')} ref = {dropRef}>
            <Text preset = 'main-title'>
                Test
            </Text>
        </div>
    )
}), (b, a) => b.isOver === a.isOver && _.isEqual(b.active, a.active))

const NewTray = memo(forwardRef(function NewTray({ parentId, active, isOver }, dropRef) {
    useEffect(() => {
        if (active) {
            console.log(active)
        }
    }, [active])

    let DOMId = parentId + '-new'
    return (
        <div id = {DOMId} className = {'group/tray transition-colors duration-main w-full h-full flex flex-col justify-center items-center rounded-main p-main'} ref = {dropRef}>
            <AddCircleRounded className = {'!transition-colors duration-main !w-8 !h-8 ' + (isOver ? 'text-text-main/muted' : 'text-text-main/killed')}/>
        </div>
    )
}), (b, a) => b.isOver === a.isOver && _.isEqual(b.active, a.active))

export default Slips