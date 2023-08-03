import { forwardRef, memo, useEffect, useMemo, useState } from 'react'
import { FileTextFill, PlusCircleFill } from 'react-bootstrap-icons'
import { useCookies } from 'react-cookie'
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
import calculateOdds from '../lib/util/calculateOdds'

const Slips = memo(function Slips() {
    const { data } = useDataContext()
    const [active, setActive] = useState()
    const isDragging = useMemo(() => active, [active])
    let [ trays, addSlip, , editSlip, ] = useStore('user_slips', 'array')
    useDndMonitor({
        onDragStart: (item) => setActive(item.active.data.current),
        onDragEnd: () => setActive(null)
    })

    let DOMId = 'slips'
    if (active !== undefined) {
        return (
            <Panel title = 'Slips' icon = {FileTextFill} classes = {'absolute bottom-0 right-0 mr-base md:mb-lg md:mr-lg w-[16rem] md:w-[32rem] overflow-auto no-scrollbar shadow-lg !animate-duration-150 ' + (isDragging ? 'animate-slideInRight' : 'animate-slideOutRight')} parentId = {DOMId}>
                <div id = {DOMId + '-trays'} className = 'w-full h-full flex flex-col gap-base'>
                    <Map items = {trays} callback = {(tray, index) => {
                        let trayId = DOMId + '-tray' + index; return (
                        <Droppable key = {index} id = {'root-' + index}>
                            <Tray data = {data} tray = {tray} timestamp = {tray.timestamp} picks = {tray.picks} onDrop = {editSlip} parentId = {trayId}/>
                        </Droppable>
                    )}}/>
                    <Droppable id = 'root-new'>
                        <NewTray onDrop = {addSlip} parentId = {DOMId}/>
                    </Droppable>
                </div>
            </Panel>
        )
    }
})

const Tray = memo(forwardRef(function Tray({ data, tray, parentId, dropped, onDrop, isOver }, dropRef) {
    useEffect(() => {
        if (dropped) {
            let droppedId = dropped.id.split('-').splice(2, 1).join('-')
            if (!tray.picks.some(pick => pick.split('-').splice(2, 1).join('-') === droppedId)) {
                onDrop(tray, {
                    ...tray,
                    picks: [...tray.picks, dropped.id]
                })
            }
        }
    }, [dropped])
    let grid = tray.picks?.length >= 3 ? 'grid-cols-3' : tray.picks.length === 2 ? 'grid-cols-2' : 'grid-cols-1'

    let DOMId = parentId + '-tray'
    return (
        <div id = {DOMId} className = {'group/tray transition-colors duration-main w-full flex flex-col gap-base p-base rounded-base ' + (isOver ? 'bg-primary-main' : 'bg-base-main/muted')} ref = {dropRef}>
            <Text id = {DOMId + '-' + tray.timestamp} preset = 'body' classes = {(isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}>
                {toDate(tray.timestamp)}
            </Text>
            <div id = {DOMId + '-picks'} className = {'w-full grid ' + grid + ' gap-base'}>
                <Map items = {tray.picks} callback = {(pick, index) => {
                    let pickId = DOMId + '-pick' + index; return (
                    <Pick key = {index} data = {data} pick = {pick} parentId = {pickId}/>
                )}}/>
            </div>
        </div>
    )
}), (b, a) => b.isOver === a.isOver && _.isEqual(b.tray, a.tray) && _.isEqual(b.data, a.data) && _.isEqual(b.dropped, a.dropped))

const NewTray = memo(forwardRef(function NewTray({ parentId, dropped, onDrop, isOver }, dropRef) {
    useEffect(() => {
        if (dropped) {
            onDrop({
                timestamp: now(),
                picks: [dropped.id]
            })
        }
    }, [dropped])

    let DOMId = parentId + '-new'
    return (
        <div id = {DOMId} className = {'group/tray transition-colors duration-main w-full h-full flex flex-col justify-center items-center p-base rounded-base ' + (isOver ? 'bg-primary-main' : 'bg-base-main/muted')} ref = {dropRef}>
            <PlusCircleFill className = {'transition-colors duration-main w-6 h-6 ' + (isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}/>
        </div>
    )
}), (b, a) => b.isOver === a.isOver && _.isEqual(b.dropped, a.dropped))

const Pick = memo(function Outcome({ pick, data, parentId }) {
    pick = useMemo(() => {
        if (pick && pick.split('-').length === 4) {
            let [eventId, betKey, valueTimestamp, outcomeName] = pick.split('-')
            let event = data.events.find(event => event.id === eventId)
            let bet = event.bets.find(bet => bet.key === betKey)
            let value = bet.values.find(value => value.timestamp === Number(valueTimestamp))
            let outcome = value.outcomes.find(outcome => (outcome.competitor ? outcome.competitor.name === outcomeName : outcome.name === outcomeName))
            return {
                bet: bet,
                outcome: outcome
            }
        }
        return null
    })
    let { bet, outcome } = pick ? pick : { bet: null, outcome: null }
    let name = useMemo(() => {
        if (pick) {
            let string = ''
            if (bet.key.includes('totals')) {
                string = outcome.name + ' ' + outcome.point
            }
            else if (bet.key.includes('spreads')) {
                if (outcome.competitor) {
                    string = outcome.competitor.name + ' ' + (outcome.point > 0 ? '+' : '') + outcome.point
                }
            }
            else if (bet.key.includes('h2h')) {
                string = (outcome.competitor ? outcome.competitor.name + ' ' + bet.name : outcome.name)
            }
            else {
                if (outcome.competitor) {
                    string = outcome.competitor.name
                }
                else {
                    string = outcome.name
                }
            }
            return string
        }
        return ''
    }, [pick])

    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-sm p-sm bg-base-main rounded-base'>
            <Text id = {DOMId + '-name'} preset = 'subtitle' classes = 'w-full text-text-main/muted text-center whitespace-nowrap overflow-hidden text-ellipsis'>
                {name}
            </Text>
            <Value value = {outcome.odds} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => b.pick === a.pick && _.isEqual(b.dat, a.data))

const Value = memo(function Value({ value, parentId }) {
    const [cookies,,] = useCookies(['odds_format'])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = 'body' classes = '!font-bold !text-lg text-text-main'>
            {calculateOdds(cookies['odds_format'], value ? value : 100)}
        </Text>
    )
})

export default Slips