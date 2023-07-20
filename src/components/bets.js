import React, { forwardRef, memo, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import _ from 'lodash'
import Text from './text'
import Map from './map'
import calculateOdds from '../lib/util/calculateOdds'
import { Drag, Draggable } from './drag'


const Bets = memo(function Bets({ event, classes, parentId }) {
    let DOMId = parentId + '-bets'
    return (
        <div id = {DOMId} className = {'w-full h-full grid grid-cols-2 gap-main' + (classes ? ' ' + classes : '')}>
            {event.bets ? (
                <Drag overlay = {OutcomeDragged} parentId = {DOMId}>
                    <Map array = {event.bets.filter(bet => bet.values[0].outcomes)} callback = {(bet, index) => {
                        let betId = DOMId + '-bet' + index; return (
                        <Bet key = {index} event = {event} bet = {bet} outcomes = {bet.values[0].outcomes} parentId = {betId} />
                    )}}/>
                </Drag>
            ) : (
                <div id = {DOMId + '-not-found'} className = {'relative w-full h-full p-main rounded-main border-thin border-divider-main' + (classes ? ' ' + classes : '')}>
                    <Text id = {DOMId + '-not-found-text'} preset = 'bet-notFound'>
                        No bets found.
                    </Text>
                </div>
            )}
        </div>
    )
}, (b, a) => b.classes === a.classes && _.isEqual(b.event, a.event) && _.isEqual(b.competitor, a.competitor))

const Bet = memo(function Bet({ event, bet, outcomes, parentId }) {
    let DOMId = parentId
    return (
        <Map array = {outcomes} callback = {(outcome, index) => {
            let data = {event: _.omit(event, 'bets'), bet: _.pick(bet, ['key', 'name']), outcome: outcome}
            let outcomeId = DOMId + '-outcome' + index; return (
            <Draggable key = {index} id = {event.id + '-' + bet.key + '-' + index} data = {data}>
                <Outcome bet = {bet} outcome = {outcome} parentId = {outcomeId}/>
            </Draggable>
        )}}/>
    )
}, (b, a) => _.isEqual(b.event, a.event) && _.isEqual(b.bet, a.bet) && _.isEqual(b.outcomes, a.outcomes))

const OutcomeDragged = function Outcome({ active, parentId }) {
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
        <div id = {DOMId} className = 'relative transition-colors duration-main w-full h-full flex flex-row justify-between items-center p-main bg-base-highlight rounded-main border-thin border-divider-highlight cursor-pointer'>
            <div id = {DOMId + '-text'} className = 'h-full flex flex-col justify-center'>
        <Text id = {DOMId + '-title'} preset = 'bet-outcome-title'>
                    {bet.name}
                </Text>
                <Text id = {DOMId + '-name'} preset = 'bet-outcome-name'>
                    {name}
                </Text>
            </div>
            <Value value = {outcome.odds} parentId = {DOMId}/>
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
        <div ref = {dragRef} {...dragProps} id = {DOMId} className = {'group/outcome relative transition-all duration-main w-full h-full flex flex-row justify-between items-center p-main bg-base-highlight rounded-main border-thin border-divider-highlight cursor-pointer' + (classes ? ' ' + classes : '')}>
            <div id = {DOMId + '-text'} className = 'flex flex-col justify-center'>
                <Text id = {DOMId + '-title'} preset = 'bet-outcome-title'>
                    {bet.name}
                </Text>
                <Text id = {DOMId + '-name'} preset = 'bet-outcome-name'>
                    {name}
                </Text>
            </div>
            <Value value = {outcome.odds} parentId = {DOMId}/>
        </div>
    )
})

const Value = memo(function Value({ value, parentId }) {
    const [cookies,,] = useCookies(['odds_format'])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = 'bet-outcome-value'>
            {calculateOdds(cookies['odds_format'], value ? value : 100)}
        </Text>
    )
})

export default Bets