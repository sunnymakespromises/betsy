import React, { memo } from 'react'
import _ from 'lodash'
import Text from './text'
import Map from './map'
import Pick from './pick'

const Bets = memo(function Bets({ event, bets, classes, parentId }) {
    let DOMId = parentId + '-bets'
    return (
        <div id = {DOMId} className = {'w-full flex flex-col gap-base' + (classes ? ' ' + classes : '')}>
            {event.is_completed ? (
                <Text id = {DOMId + '-bets-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                    Event is completed.
                </Text>
            ) : bets.length > 0 ? (
                <Map items = {bets.filter(bet => bet.values[bet.values.length - 1].outcomes)} callback = {(bet, index) => {
                    let betId = DOMId + '-bet' + index; return (
                    <Bet key = {index} event = {event} bet = {bet} outcomes = {bet.values[bet.values.length - 1].outcomes} parentId = {betId} />
                )}}/>
            ) : (
                <Text id = {DOMId + '-bets-not-found'} preset = 'body' classes = 'w-full bg-base-main/muted rounded-base p-base text-text-main/killed text-center'>
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
                let data = { event: event, bet: bet, outcome: outcome, timestamp: bet.values[bet.values.length - 1].timestamp, did_hit: null }
                let outcomeId = DOMId + '-outcome' + index; return (
                <Pick key = {index} id = {event.id + '-' + bet.key + '-' + index} expandedPick = {data} isEditable = {false} parentId = {outcomeId}/>
            )}}/>
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event) && _.isEqual(b.bet, a.bet) && _.isEqual(b.outcomes, a.outcomes))

export default Bets