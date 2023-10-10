export function expandPick(events, compressedPick) {
    if (compressedPick.split('-').length === 5) {
        let [eventId, betKey, outcomeName, valueTimestamp, didHit] = compressedPick.split('-')
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

export function compressPick(expandedPick) {
    let { event, bet, timestamp, outcome, did_hit } = expandedPick
    if (event && bet && timestamp && outcome) {
        return event.id + '-' + bet.key + '-' + (outcome.competitor ? outcome.competitor.name : outcome.name) + '-' + timestamp + '-' + (did_hit !== null ? (did_hit === true ? 'true' : did_hit === false ? 'false' : 'voided') : 'null')
    }
    return null
}

export function expandSlip(events, compressedSlip) {
    let newExpandedSlip = JSON.parse(JSON.stringify(compressedSlip))
    return {...newExpandedSlip, picks: newExpandedSlip.picks.map(compressedPick => {
        return expandPick(events, compressedPick)
    })}
}

export function compressSlip(expandedSlip) {
    let newCompressedSlip = JSON.parse(JSON.stringify(expandedSlip))
    return {...newCompressedSlip, picks: newCompressedSlip.picks.map(expandedPick => {
        return compressPick(expandedPick)
    })}
}

export function getMostRecentVersionOfPick(expandedPick) {
    return {
        ...expandedPick, 
        outcome: {
            ...expandedPick.outcome,
            odds: expandedPick.bet.values[expandedPick.bet.values.length - 1].outcomes.find(outcome => expandedPick.outcome.competitor ? expandedPick.outcome.competitor.name === outcome.competitor?.name : expandedPick.outcome.name === outcome.name).odds
        },
        timestamp: expandedPick.bet.values[expandedPick.bet.values.length - 1].timestamp
    }
}