import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Text from './text'
import Conditional from './conditional'
import Image from './image'

export default function Competitor({competitor, classes, textClasses, link = false, image = true}) {
    const ref = useRef()
    const [imageHeight, setImageHeight] = useState(0)

    useEffect(() => {
        getHeight()
    }, [ref?.current?.clientHeight])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        window.addEventListener('resize', getHeight)
        return () => window.removeEventListener('resize', getHeight)
    }, [])

    function getHeight() {
        setImageHeight((getComputedStyle(ref?.current).height.replace('px', '')) * 0.8 + 'px')
    }

    if (link) {
        return (
            <Link to = {'/competitors?id=' + competitor.id} ref = {ref} className = {'competitor flex flex-row items-center gap-tiny' + (classes ? ' ' + classes : '')}>
                <Insides/>
            </Link>
        )
    }
    else {
        return (
            <div ref = {ref} className = {'competitor flex flex-row items-center gap-tiny' + (classes ? ' ' + classes : '')}>
                <Insides/>
            </div>
        )
    }

    function Insides() {
        return (
            <>
                <Conditional value = {competitor.picture}>
                    <Image external path = {competitor.picture} classes = 'aspect-square rounded-full' styles = {{ height: imageHeight}}/>
                </Conditional>
                <Text preset = 'competitor' classes = {textClasses ? textClasses : ''}>
                    {competitor.name}
                </Text>
            </>
        )
    }
}

// export default function Money({amount, classes, textClasses, ...extras}) {
//     const textRef = useRef()
//     const [coinHeight, setCoinHeight] = useState(0)

//     useEffect(() => {
//         getHeight()
//     }, [textRef?.current?.clientHeight, amount])

//     useEffect(() => {
//         if (typeof window === 'undefined') {
//             return
//         }
//         window.addEventListener('resize', getHeight)
//         return () => window.removeEventListener('resize', getHeight)
//     }, [])

//     function getHeight() {
//         setCoinHeight((getComputedStyle(textRef?.current).height.replace('px', '') * 0.7) + 'px')
//     }
    
//     return (
//         <div ref = {textRef} className = {'money-container flex flex-row items-center gap-tiny md:gap-small' + (classes ? ' ' + classes : '')} {...extras}>
//             <Text classes = {'money-value' + (textClasses ? ' ' + textClasses : '')}>
//                 {amount ? amount : '0.00'}
//             </Text>
//             <Image path = {'images/coin.svg'} classes = 'money-coin aspect-square' styles = {{height: coinHeight}}/>
//         </div>
//     )
// }