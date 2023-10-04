import { useCookies } from 'react-cookie'
import getFormattedOdds from '../lib/util/getFormattedOdds'
import calculateOdds from '../lib/util/calculateOdds'

function useOdds() {
    const [cookies,,] = useCookies(['odds_format'])

    function getOdds(value) {
        return getFormattedOdds(cookies['odds_format'], value ? value : 1)
    }

    function getOddsFromPicks(expandedPicks) {
        return calculateOdds(cookies['odds_format'], expandedPicks)
    }
    
    return { getOdds, getOddsFromPicks }
}

export { useOdds }