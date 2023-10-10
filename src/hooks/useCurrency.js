import { useCookies } from 'react-cookie'
import getFormattedMoneyAmount, { getCurrencySymbol } from '../lib/util/getFormattedMoneyAmount'

function useCurrency() {
    const [cookies,,] = useCookies(['currency'])

    function getAmount(from, to, amount, shortened) {
        return getFormattedMoneyAmount(from ? from : cookies['currency'], to ? to : cookies['currency'], amount ? amount : '0.00', shortened)
    }

    function getSymbol() {
        return getCurrencySymbol(cookies['currency'])
    }
    
    return { getAmount, getSymbol }
}

export { useCurrency }