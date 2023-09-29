export default function expandPick(events, pick) {
    if (pick.split('-').length === 5) {
        let [eventId, betKey, outcomeName, valueTimestamp, didHit] = pick.split('-')
        didHit = didHit === 'true' ? true : didHit === 'false' ? false : didHit === 'voided' ? 'voided' : null
        let event = events.find(event => event.id === eventId)
        let bet = event?.bets?.find(bet => bet.key === betKey)
        let outcome = bet?.values?.find(value => value.timestamp === Number(valueTimestamp))?.outcomes?.find(outcome => (outcome.competitor ? outcome.competitor.name === outcomeName : outcome.name === outcomeName))
        if (event && bet && valueTimestamp && outcome) {
            return {
                event: event,
                bet: bet,
                timestamp: valueTimestamp,
                outcome: outcome,
                did_hit: didHit === 'null' ? null : didHit
            }
        }
    }
    return null
}

export function compressPick(pick) {
    let { event, bet, timestamp, outcome, did_hit } = pick
    if (event && bet && timestamp && outcome) {
        return event.id + '-' + bet.key + '-' + (outcome.competitor ? outcome.competitor.name : outcome.name) + '-' + timestamp + '-' + (did_hit !== null ? (did_hit === true ? 'true' : did_hit === false ? 'false' : 'voided') : 'null')
    }
    return null
}