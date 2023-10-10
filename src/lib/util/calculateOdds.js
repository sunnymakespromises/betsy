import getFormattedOdds from './getFormattedOdds'

export default function calculateOdds(format, expandedPicks) {
    expandedPicks = expandedPicks.filter(pick => pick.did_hit !== 'voided')
    let totalDecimalOdds = Number((expandedPicks.map(pick => pick.outcome.odds).reduce((a, b) => a * b)).toFixed(2))
    let formattedOdds = getFormattedOdds(format, totalDecimalOdds)
    return { 
        string: formattedOdds,
        decimal: totalDecimalOdds
    }
}