import { memo } from 'react'
import { useCookies } from 'react-cookie'
import Text from './text'
import calculateCurrency from '../lib/util/calculateCurrency'

const Money = memo(function Money({amount, classes, preset = 'main-money', shortened = false, parentId }) {
    const [cookies,,] = useCookies(['currency'])
    let DOMId = parentId + 'money-'
    return (
        <Text id = {DOMId + 'amount'} preset = {preset}>
            {calculateCurrency(cookies['currency'], amount ? amount : '0.00', shortened)}
        </Text>
    )
}, (b, a) => b.amount === a.amount && b.classes === a.classes && b.preset === a.preset && b.shortened === a.shortened)

export default Money