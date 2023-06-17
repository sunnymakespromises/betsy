import { useEffect, useRef, useState } from 'react'
import Image from './image'
import Text from './text'
import { useCookies } from 'react-cookie'
import calculateCurrency from '../lib/util/calculateCurrency'

export default function Money({amount, classes, textClasses, shortened = false, ...extras}) {
    const [cookies, setCookie, removeCookie] = useCookies()
    const textRef = useRef()
    
    return (
        <div ref = {textRef} className = {'money-container flex flex-row items-center gap-tiny md:gap-small' + (classes ? ' ' + classes : '')} {...extras}>
            <Text classes = {'money-value' + (textClasses ? ' ' + textClasses : '')}>
                {calculateCurrency(cookies['currency'], amount ? amount : '0.00', shortened)}
            </Text>
            {/* <Image path = {'images/coin.svg'} classes = 'money-coin aspect-square' styles = {{height: coinHeight}}/> */}
        </div>
    )
}