import { useEffect, useRef, useState } from 'react'
import Image from './image'
import Text from './text'

export default function Money({amount, classes, textClasses, ...extras}) {
    const textRef = useRef()
    const [coinHeight, setCoinHeight] = useState(0)

    useEffect(() => {
        getHeight()
    }, [textRef?.current?.clientHeight, amount])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        window.addEventListener('resize', getHeight)
        return () => window.removeEventListener('resize', getHeight)
    }, [])

    function getHeight() {
        setCoinHeight((getComputedStyle(textRef?.current).height.replace('px', '') * 0.7) + 'px')
    }
    
    return (
        <div ref = {textRef} className = {'money-container flex flex-row items-center gap-tiny md:gap-small' + (classes ? ' ' + classes : '')} {...extras}>
            <Text classes = {'money-value' + (textClasses ? ' ' + textClasses : '')}>
                {amount ? amount : '0.00'}
            </Text>
            <Image path = {'images/coin.svg'} classes = 'money-coin aspect-square' styles = {{height: coinHeight}}/>
        </div>
    )
}