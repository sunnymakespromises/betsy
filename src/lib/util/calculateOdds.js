import getFormattedOdds from './getFormattedOdds'

export default function calculateOdds(format, expandedPicks) {
    expandedPicks = expandedPicks.filter(pick => pick.did_hit !== 'voided')
    let totalDecimalOdds = expandedPicks.map(pick => pick.outcome.odds).reduce((a, b) => a * b)
    let totalAmericanOdds = totalDecimalOdds === 1 ? 100 : Number((totalDecimalOdds > 2 ? ((totalDecimalOdds - 1) * 100) : (-100 / (totalDecimalOdds - 1))).toFixed(0))
    let formattedOdds = getFormattedOdds(format, totalDecimalOdds)
    return { 
        string: formattedOdds,
        american: totalAmericanOdds,
        decimal: totalDecimalOdds
    }
}