import Text from './text'
import { useCookies } from 'react-cookie'
import calculateCurrency from '../lib/util/calculateCurrency'

export default function Money({amount, classes, textClasses, shortened = false, ...extras}) {
    const [cookies,,] = useCookies()
    
    return (
        <div className = {'money-container flex flex-row items-center gap-tiny md:gap-small' + (classes ? ' ' + classes : '')} {...extras}>
            <Text classes = {'money-value' + (textClasses ? ' ' + textClasses : '')}>
                {calculateCurrency(cookies['currency'], amount ? amount : '0.00', shortened)}
            </Text>
        </div>
    )
}