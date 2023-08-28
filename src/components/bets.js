import React, { forwardRef, memo, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import _ from 'lodash'
import Text from './text'
import Map from './map'
import calculateOdds from '../lib/util/calculateOdds'
import { Drag, Draggable } from './drag'


const Bets = memo(function Bets({ event, bets, classes, parentId }) {
    let DOMId = parentId + '-bets'
    return (
        <div id = {DOMId} className = {'w-full flex flex-col gap-base' + (classes ? ' ' + classes : '')}>
            {bets.length > 0 ? (
                <Drag overlay = {PickOverlay} parentId = {DOMId}>
                    <Map items = {bets.filter(bet => bet.values[0].outcomes)} callback = {(bet, index) => {
                        let betId = DOMId + '-bet' + index; return (
                        <Bet key = {index} event = {event} bet = {bet} outcomes = {bet.values[0].outcomes} parentId = {betId} />
                    )}}/>
                </Drag>
            ) : (
                <Text id = {DOMId + '-bets-not-found'} preset = 'body' classes = 'w-full bg-base-main/muted rounded-base p-base text-text-highlight/killed text-center'>
                    No bets found.
                </Text>
            )}
        </div>
    )
}, (b, a) => b.classes === a.classes && _.isEqual(b.event, a.event) && _.isEqual(b.bets, a.bets) && _.isEqual(b.competitor, a.competitor))

const Bet = memo(function Bet({ event, bet, outcomes, parentId }) {
    let grid = outcomes?.length >= 3 ? 'grid-cols-3' : outcomes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'w-full grid ' + grid + ' gap-base'}>
            <Map items = {outcomes} callback = {(outcome, index) => {
                let data = {id: event.id + '-' + bet.key + '-' + (outcome.competitor ? outcome.competitor.name : outcome.name) + '-' + bet.values[0].timestamp, event: _.omit(event, 'bets'), bet: _.pick(bet, ['key', 'name']), outcome: outcome}
                let outcomeId = DOMId + '-outcome' + index; return (
                <Draggable key = {index} id = {event.id + '-' + bet.key + '-' + index} data = {data}>
                    <Pick event = {event} bet = {bet} outcome = {outcome} draggable = {true} isOver = {false} parentId = {outcomeId}/>
                </Draggable>
            )}}/>
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event) && _.isEqual(b.bet, a.bet) && _.isEqual(b.outcomes, a.outcomes))

const PickOverlay = function PickOverlay({ active, parentId }) {
    let DOMId = parentId
    let { event, bet, outcome } = active
    let name = useMemo(() => {
        let string = ''
        if (bet.key.includes('totals')) {
            string = outcome.name + ' ' + outcome.point
        }
        else if (bet.key.includes('spreads')) {
            if (outcome.competitor) {
                string = outcome.competitor.name + ' ' + (outcome.point > 0 ? '+' : '') + outcome.point
            }
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
    }, [bet, outcome])

    let eventName = useMemo(() => {
        if (event) {
            if (event.is_outright) {
                return (
                    <Text id = {DOMId + '-event-name'} preset = 'subtitle' classes = {'w-full text-center whitespace-nowrap text-text-main/killed'}>
                        {event.name}
                    </Text>
                )
            }
            return (
                <div id = {DOMId + '-event'} className = 'group/info w-full flex justify-center items-center'>
                    <Text id = {DOMId + '-event-competitor0-name'} preset = 'subtitle' classes = {'max-w-full text-center whitespace-nowrap overflow-hidden text-ellipsis text-text-main/killed'}>
                        {event.competitors[0].name}
                    </Text>
                    <Text id = {DOMId + '-event-competitors-separator'} preset = 'subtitle' classes = {'text-center w-min flex text-text-main/killed'}>
                        &nbsp;{event.name.includes('@') ? '@' : 'v'}&nbsp;
                    </Text>
                    <Text id = {DOMId + '-event-competitor1-name'} preset = 'subtitle' classes = {'max-w-full text-center whitespace-nowrap overflow-hidden text-ellipsis text-text-main/killed'}>
                        {event.competitors[1].name}
                    </Text>
                </div>
            )
        }
        return <></>
    })

    return (
        <div id = {DOMId} className = 'relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-xs p-sm bg-base-main rounded-base border-base border-base-highlight'>
            {eventName}
            <Text id = {DOMId + '-bet-name'} preset = 'subtitle' classes = 'text-text-main/killed'>
                {bet.name}
            </Text>
            <Text id = {DOMId + '-name'} preset = 'body' classes = 'w-full text-primary-main text-center whitespace-nowrap overflow-hidden text-ellipsis'>
                {name}
            </Text>
            <Value value = {outcome.odds} isDragging = {true} parentId = {DOMId}/>
        </div>
    )
}

export const Pick = forwardRef(function Pick({ event, bet, outcome, draggable, isDragging, isOver, classes, parentId, ...dragProps }, dragRef) {
    let DOMId = parentId
    let name = useMemo(() => {
        let string = ''
        if (bet.key.includes('totals')) {
            string = outcome.name + ' ' + outcome.point
        }
        else if (bet.key.includes('spreads')) {
            if (outcome.competitor) {
                string = outcome.competitor.name + ' ' + (outcome.point > 0 ? '+' : '') + outcome.point
            }
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
    }, [bet, outcome])

    let eventName = useMemo(() => {
        if (bet && outcome && event && !draggable) {
            if (event.is_outright) {
                return (
                    <Text id = {DOMId + '-event-name'} preset = 'subtitle' classes = {'w-full text-center whitespace-nowrap ' + (isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}>
                        {event.name}
                    </Text>
                )
            }
            return (
                <div id = {DOMId + '-event'} className = 'group/info w-full flex justify-center items-center'>
                    <Text id = {DOMId + '-event-competitor0-name'} preset = 'subtitle' classes = {'max-w-full text-center whitespace-nowrap overflow-hidden text-ellipsis ' + (isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}>
                        {event.competitors[0].name}
                    </Text>
                    <Text id = {DOMId + '-event-competitors-separator'} preset = 'subtitle' classes = {'text-center w-min flex ' + (isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}>
                        &nbsp;{event.name.includes('@') ? '@' : 'v'}&nbsp;
                    </Text>
                    <Text id = {DOMId + '-event-competitor1-name'} preset = 'subtitle' classes = {'max-w-full text-center whitespace-nowrap overflow-hidden text-ellipsis ' + (isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}>
                        {event.competitors[1].name}
                    </Text>
                </div>
            )
        }
        return <></>
    })
    return (
        <div ref = {dragRef} {...dragProps} id = {DOMId} className = {'group/outcome relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-xs p-sm rounded-base ' + (draggable ? (isDragging ? 'bg-base-main' : 'bg-base-main/muted hover:bg-base-main') : (isOver ? 'bg-primary-main' : 'bg-base-main/muted')) + (classes ? ' ' + classes : '')}>
            {eventName}
            <Text id = {DOMId + '-bet-name'} preset = 'subtitle' classes = {draggable ? (isDragging ? 'text-text-main/killed' : 'text-text-main/killed group-hover/outcome:text-text-main/killed') : (isOver ? 'text-text-primary/killed' : 'text-text-main/killed')}>
                {bet.name}
            </Text>
            <Text id = {DOMId + '-name'} preset = 'body' classes = {'w-full text-center whitespace-nowrap overflow-hidden text-ellipsis ' + (draggable ? (isDragging ? 'text-primary-main' : 'text-primary-main group-hover/outcome:text-primary-main') : (isOver ? 'text-text-primary' : 'text-primary-main'))}>
                {name}
            </Text>
            <Value value = {outcome.odds} draggable = {draggable} isOver = {isOver} isDragging = {isDragging} parentId = {DOMId}/>
        </div>
    )
})

const Value = memo(function Value({ value, draggable, isOver, isDragging, parentId }) {
    const [cookies,,] = useCookies(['odds_format'])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = 'title' classes = {'!font-bold ' + (draggable ? (isDragging ? 'text-primary-main' : 'text-primary-main group-hover/outcome:text-primary-main') : (isOver ? 'text-text-primary' : 'text-primary-main'))}>
            {calculateOdds(cookies['odds_format'], value ? value : 100)}
        </Text>
    )
})

export default Bets