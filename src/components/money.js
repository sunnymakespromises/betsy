import Text from './text'
import { useCookies } from 'react-cookie'
import calculateCurrency from '../lib/util/calculateCurrency'
import { memo } from 'react'

const Money = memo(function Money({amount, classes, textClasses, shortened = false, parentId }) {
    const [cookies,,] = useCookies(['currency'])
    let DOMId = parentId + 'money-'
    return (
        <div id = {DOMId + 'container'} className = {(classes ? ' ' + classes : '')}>
            <Text id = {DOMId + 'amount'} preset = 'money-amount' classes = {(textClasses ? ' ' + textClasses : '')}>
                {calculateCurrency(cookies['currency'], amount ? amount : '0.00', shortened)}
            </Text>
        </div>
    )
}, (b, a) => b.amount === a.amount && b.classes === a.classes && b.textClasses === a.textClasses && b.shortened === a.shortened)

export default Money