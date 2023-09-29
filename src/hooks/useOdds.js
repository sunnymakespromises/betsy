import { useCookies } from 'react-cookie'
import getFormattedOdds from '../lib/util/getFormattedOdds'
import calculateOdds from '../lib/util/calculateOdds'

function useOdds() {
    const [cookies,,] = useCookies(['odds_format'])

    function getOdds(value) {
        return getFormattedOdds(cookies['odds_format'], value ? value : 100)
    }

    function getOddsFromPicks(picks) {
        return calculateOdds(cookies['odds_format'], picks)
    }
    
    return { getOdds, getOddsFromPicks }
}

export { useOdds }