import { useCookies } from 'react-cookie'
import calculateCurrency from '../lib/util/calculateCurrency'

function useCurrency() {
    const [cookies,,] = useCookies(['currency'])

    function getAmount(amount, shortened) {
        return calculateCurrency(cookies['currency'], amount ? amount : '0.00', shortened)
    }
    
    return { getAmount }
}

export { useCurrency }