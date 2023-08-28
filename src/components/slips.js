import React, { forwardRef, memo, useEffect, useMemo, useState } from 'react'
import { FileTextFill, PlusCircleFill } from 'react-bootstrap-icons'
import { useDndMonitor } from '@dnd-kit/core'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useStore } from '../hooks/useStore'
import { Droppable } from './drag'
import Map from './map'
import Text from './text'
import Panel from './panel'
import now from '../lib/util/now'
import toDate from '../lib/util/toDate'
import { default as short } from 'short-uuid'
import { usePrevious } from '../hooks/usePrevious'
import Conditional from './conditional'
import { Pick } from './bets'

const SlipsPanel = memo(function SlipsPanel() {
    const [active, setActive] = useState()
    const [isVisible, setIsVisible] = useState(false)

    useDndMonitor({
        onDragStart: (item) => setActive(item.active.data.current),
        onDragEnd: () => setActive(null)
    })

    useEffect(() => {
        if (active) {
            setIsVisible(true)
        }
        else {
            setTimeout(() => {
                setIsVisible(false)
            }, 500)
        }
    }, [active])

    let DOMId = 'slips'
    if (active !== undefined) {
        return (
            <Panel title = 'Slips' icon = {FileTextFill} classes = {'absolute bottom-0 right-0 w-full md:w-[32rem] h-min max-h-full overflow-auto no-scrollbar shadow-lg z-[100] !animate-duration-150 ' + (isVisible ? 'animate-slideInRight' : 'animate-slideOutRight')} parentId = {DOMId}>
                <Slips parentId = {DOMId}/>
            </Panel>
        )
    }

})

export const Slips = memo(function Slips({ editable = false, parentId }) {
    const { data } = useDataContext()
    let [ slips, addSlip, , editSlip, ] = useStore('user_slips', 'array')

    let DOMId = parentId + '-slips'
    return (
        <div id = {DOMId + '-slips'} className = 'w-full h-full flex flex-col gap-base'>
            <Conditional value = {slips?.length > 0}>
                <Map items = {slips} callback = {(slip, index) => {
                    let slipId = DOMId + '-slip' + index; return (
                    <Droppable key = {index} id = {'root-' + index}>
                        <Slip slip = {slip} data = {data} onDrop = {addToSlip} onRemove = {removeFromSlip} editable = {editable} parentId = {slipId}/>
                    </Droppable>
                )}}/>
            </Conditional>
            <Conditional value = {slips?.length < 1}>
                <Text id = {DOMId + '-slips-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                    No slips found.
                </Text>
            </Conditional>
            <Conditional value = {!editable}>
                <Droppable id = 'root-new'>
                    <NewSlip onDrop = {addSlip} parentId = {DOMId}/>
                </Droppable>
            </Conditional>
        </div>
    )

    function removeFromSlip(selected, removed) {
        let newSlip = JSON.parse(JSON.stringify(selected))
        newSlip.picks = newSlip.picks.filter(pick => pick !== removed)
        editSlip(selected, newSlip)
    }

    function addToSlip(selected, added) {
        let newSlip = JSON.parse(JSON.stringify(selected))
        newSlip.picks.push(added)
        editSlip(selected, newSlip)
    }
}, (b, a) => b.editable === a.editable)

export const Slip = memo(forwardRef(function Slip({ slip, data, dropped, onDrop, onRemove, isOver, editable, parentId }, dropRef) {
    let expandedSlip = useMemo(() => {
        let expandedSlip = JSON.parse(JSON.stringify(slip))
        for (let i = 0; i < expandedSlip.picks?.length; i++) {
            let pick = expandedSlip.picks[i]
            if (pick && pick.split('-').length === 4) {
                let [eventId, betKey, outcomeName, valueTimestamp] = pick.split('-')
                let event = data.events.find(event => event.id === eventId)
                let bet = event?.bets?.find(bet => bet.key === betKey)
                let value = bet?.values?.find(value => value.timestamp === Number(valueTimestamp))
                let outcome = value?.outcomes?.find(outcome => (outcome.competitor ? outcome.competitor.name === outcomeName : outcome.name === outcomeName))
                if (event && bet && value && outcome) {
                    expandedSlip.picks[i] = {
                        event: event,
                        bet: bet,
                        outcome: outcome
                    }
                }
                else {
                    onRemove(slip, pick)
                }
            }
        }
        return expandedSlip
    }, [slip])

    useEffect(() => {
        if (!editable && dropped) {
            let [ eventId, betKey, ,  ] = dropped.id.split('-')
            if (!expandedSlip.picks.some(pick => pick.event.id === eventId && pick.bet.key === betKey)) {
                onDrop(slip, dropped.id)
            }
        }
    }, [dropped])

    let grid = expandedSlip.picks.length >= 3 ? 'grid-cols-3' : expandedSlip.picks.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
    let DOMId = parentId + '-slip'
    if (expandedSlip.picks.length > 0) {
        return (
            <div id = {DOMId} className = {'group/slip transition-colors duration-main w-full flex flex-col items-center gap-base ' + (isOver ? '' : '')} ref = {dropRef}>
                <Text id = {DOMId + '-' + expandedSlip.timestamp} preset = 'title' classes = {(isOver ? 'text-primary-main' : 'text-primary-main')}>
                    {expandedSlip.name}
                </Text>
                <div id = {DOMId + '-picks'} className = {'w-full grid ' + grid + ' gap-base'}>
                    <Map items = {expandedSlip.picks} callback = {(pick, index) => {
                        let pickId = DOMId + '-pick' + index; return (
                        <Pick key = {index} event = {pick.event} bet = {pick.bet} outcome = {pick.outcome} draggable = {false} editable = {editable} isOver = {isOver} parentId = {pickId}/>
                    )}}/>
                </div>
            </div>
        )
    }
    return null
}), (b, a) => b.isOver === a.isOver && b.editable === a.editable && _.isEqual(b.slip, a.slip) && _.isEqual(b.data, a.data) && _.isEqual(b.dropped, a.dropped))

const NewSlip = memo(forwardRef(function NewSlip({ parentId, dropped, onDrop, isOver }, dropRef) {
    const previousDropped = usePrevious(dropped)
    useEffect(() => {
        if (dropped && !_.isEqual(dropped, previousDropped)) { // fixes an issue where once something is dropped into new slip, everytime it re-renders it adds another copy
            let time = now()
            onDrop({
                id: short.generate(),
                name: toDate(time),
                timestamp: time,
                picks: [dropped.id]
            })
        }
    }, [dropped])

    let DOMId = parentId + '-new'
    return (
        <div id = {DOMId} className = {'group/slip transition-colors duration-main w-full h-full flex flex-col justify-center items-center p-base rounded-base ' + (isOver ? 'bg-primary-main' : 'bg-base-main/muted')} ref = {dropRef}>
            <PlusCircleFill className = {'transition-colors duration-main w-6 h-6 ' + (isOver ? 'text-text-primary' : 'text-primary-main')}/>
        </div>
    )
}), (b, a) => b.isOver === a.isOver && _.isEqual(b.dropped, a.dropped))

export default SlipsPanel