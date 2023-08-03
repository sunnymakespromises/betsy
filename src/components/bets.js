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
            {bets ? (
                <Drag overlay = {OutcomeOverlay} parentId = {DOMId}>
                    <Map items = {bets.filter(bet => bet.values[0].outcomes)} callback = {(bet, index) => {
                        let betId = DOMId + '-bet' + index; return (
                        <Bet key = {index} event = {event} bet = {bet} outcomes = {bet.values[0].outcomes} parentId = {betId} />
                    )}}/>
                </Drag>
            ) : (
                <Text id = {DOMId + '-bets-not-found'} preset = 'body' classes = 'w-full bg-base-main rounded-base p-base text-text-highlight/killed'>
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
        <div id = {DOMId} className = 'w-full flex flex-col items-center gap-sm'>
            <div id = {DOMId + '-title'} className = 'w-full flex justify-center items-center gap-base'>
                <div className = 'w-full transition-colors duration-main border-t-sm border-divider-main/muted'/>
                <Text id = {DOMId + '-title-text'} preset = 'body' classes = 'text-text-main/muted'>
                    {bet.name}
                </Text>
                <div className = 'w-full transition-colors duration-main border-t-sm border-divider-main/muted'/>
            </div>
            <div id = {DOMId + '-outcomes'} className = {'w-full grid ' + grid + ' gap-base'}>
                <Map items = {outcomes} callback = {(outcome, index) => {
                    let data = {id: event.id + '-' + bet.key + '-' + bet.values[0].timestamp + '-' + (outcome.competitor ? outcome.competitor.name : outcome.name), event: _.omit(event, 'bets'), bet: _.pick(bet, ['key', 'name']), outcome: outcome}
                    let outcomeId = DOMId + '-outcome' + index; return (
                    <Draggable key = {index} id = {event.id + '-' + bet.key + '-' + index} data = {data}>
                        <Outcome bet = {bet} outcome = {outcome} parentId = {outcomeId}/>
                    </Draggable>
                )}}/>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event) && _.isEqual(b.bet, a.bet) && _.isEqual(b.outcomes, a.outcomes))

const OutcomeOverlay = function OutcomeOverlay({ active, parentId }) {
    let { bet, outcome } = active
    let name = useMemo(() => {
        if (active) {
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
    }, [active])

    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-sm p-sm bg-primary-main rounded-base shadow-lg'>
            <Text id = {DOMId + '-name'} preset = 'subtitle' classes = 'w-full text-text-primary/muted text-center whitespace-nowrap overflow-hidden text-ellipsis'>
                {name}
            </Text>
            <Value value = {outcome.odds} isDragging = {true} parentId = {DOMId}/>
        </div>
    )
}

const Outcome = forwardRef(function Outcome({ bet, outcome, isDragging, classes, parentId, ...dragProps }, dragRef) {
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

    let DOMId = parentId
    return (
        <div ref = {dragRef} {...dragProps} id = {DOMId} className = {'group/outcome relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-xs p-sm rounded-base ' + (isDragging ? 'bg-primary-main' : 'bg-base-main hover:bg-primary-main') + (classes ? ' ' + classes : '')}>
            <Text id = {DOMId + '-name'} preset = 'subtitle' classes = {'w-full text-center whitespace-nowrap overflow-hidden text-ellipsis ' + (isDragging ? 'text-text-primary/muted' : 'text-text-main/muted group-hover/outcome:text-text-primary/muted')}>
                {name}
            </Text>
            <Value value = {outcome.odds} isDragging = {isDragging} parentId = {DOMId}/>
        </div>
    )
})

const Value = memo(function Value({ value, isDragging, parentId }) {
    const [cookies,,] = useCookies(['odds_format'])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = 'body' classes = {'!font-bold !text-lg ' + (isDragging ? 'text-text-primary' : 'text-text-main group-hover/outcome:text-text-primary')}>
            {calculateOdds(cookies['odds_format'], value ? value : 100)}
        </Text>
    )
})

export default Bets