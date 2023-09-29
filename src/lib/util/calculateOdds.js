import getFormattedOdds from './getFormattedOdds'

export default function calculateOdds(format, picks) {
    picks = picks.filter(pick => pick.did_hit !== 'voided')
    let oddsArray = picks.map(pick => {
        let odds = pick.outcome.odds
        return (odds > 0 ? ((odds / 100) + 1) : ((odds - 100) / odds))
    })
    let totalDecimalOdds = 1
    for (const odd of oddsArray) {
        totalDecimalOdds = (totalDecimalOdds * odd)
    }
    let totalAmericanOdds = totalDecimalOdds === 1 ? 100 : Number((totalDecimalOdds > 2 ? ((totalDecimalOdds - 1) * 100) : (-100 / (totalDecimalOdds - 1))).toFixed(0))
    let formattedOdds = getFormattedOdds(format, totalAmericanOdds)
    return { 
        string: formattedOdds,
        american: totalAmericanOdds,
        decimal: totalDecimalOdds
    }
}