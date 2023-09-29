import updateItem from './aws/db/updateItem'
import insertItem from './aws/db/insertItem'
import getTable from './aws/db/getTable'
import now from './util/now'
import incrementItem from './aws/db/incrementItem'
import expandPick from './util/expandPick'

async function placeBet(user, slip, wager, odds, potential_earnings) {
    const response = {
        status: false,
        message: '',
        changes: null
    }

    if (user) {
        if (slip) {
            wager = Number(wager)
            if (wager) {
                if (wager > 0.09) {
                    if (wager <= user.balances[user.balances.length - 1].value) {
                        let events = await getTable('events', null)
                        let allPicksAreValid = true
                        let involves = { events: [], competitions: [], sports: [], competitors: []}
                        for (let pick of slip.picks) {
                            let expandedPick = expandPick(events, pick)
                            if (expandedPick && !expandedPick.event.is_completed) {
                                involves.events.push(expandedPick.event.id)
                                involves.competitions.push(expandedPick.event.competition.id)
                                involves.sports.push(expandedPick.event.sport.id)
                                if (expandedPick.outcome.competitor) {
                                    involves.competitors.push(expandedPick.outcome.competitor.id)
                                }
                            }
                            else {
                                allPicksAreValid = false
                            }
                        }
                        if (allPicksAreValid) {
                            let newSlip = {
                                id: slip.id,
                                owner: user.id,
                                timestamp: slip.timestamp,
                                picks: slip.picks,
                                wager: wager,
                                odds: odds,
                                potential_earnings: potential_earnings,
                                did_hit: null
                            }
                            let newBalance = { timestamp: now(), value: Number((user.balances[user.balances.length - 1].value - wager).toFixed(2)) }
                            await insertItem('slips', newSlip)
                            await updateItem('users', user.id, { slips: [...user.slips.map(slip => slip.id), newSlip.id], balances: [...user.balances, newBalance ], ...(newBalance.value <= 0 ? { is_locked: true } : {})})
                            for (const category of Object.keys(involves)) {
                                involves[category] = [...new Set(involves[category])]
                                for (const item of involves[category]) {
                                    await incrementItem(category, item, 'slip_count')
                                }
                            }
                            response.changes = { slips: [...user.slips, newSlip], balances: [...user.balances, newBalance ], ...(newBalance.value <= 0 ? { is_locked: true } : {}) }
                            response.status = true
                        }
                        else {
                            response.message = 'Picks are not valid.'
                        }
                    }
                    else {
                        response.message = 'Insufficient funds.'
                    }
                }
                else {
                    response.message = 'Must wager more than 0.09'
                }
            }
            else {
                response.message = 'Wager is not a number.'
            }
        }
        else {
            response.message = 'No slip found.'
        }
    }
    else {
        response.message = 'User not found.'
    }

    return response
}

export { placeBet }