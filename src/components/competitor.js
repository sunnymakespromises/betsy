import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Text from './text'
import Conditional from './conditional'
import Image from './image'

export default function Competitor({ id, picture, name, classes, textClasses, link = false, image = false, parentId }) {
    let DOMId = parentId + 'competitor-'
    const ref = useRef()
    const [imageHeight, setImageHeight] = useState(0)

    useEffect(() => {
        getHeight()
    }, [ref.current?.clientHeight])

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
            <Link id = {DOMId + 'container'} to = {'/competitors?id=' + id} ref = {ref} className = {'group flex flex-row items-center gap-micro overflow-hidden' + (classes ? ' ' + classes : '')}>
                <Insides parentId = {DOMId}/>
            </Link>
        )
    }
    else {
        return (
            <div id = {DOMId + 'container'} className = {'group flex flex-row items-center gap-micro overflow-hidden' + (classes ? ' ' + classes : '')} ref = {ref}>
                <Insides parentId = {DOMId}/>
            </div>
        )
    }

    function Insides({ parentId }) {
        let DOMId = parentId
        
        return (
            <React.Fragment key = {parentId}>
                <Conditional value = {image && picture}>
                    <Image id = {DOMId + 'image'} external path = {picture} classes = {'transition-all duration-main aspect-square rounded-full'} styles = {{ height: imageHeight}}/>
                </Conditional>
                <Text id = {DOMId + 'name'} preset = 'competitor' classes = {textClasses ? textClasses : ''}>
                    {name}
                </Text>
            </React.Fragment>
        )
    }
}