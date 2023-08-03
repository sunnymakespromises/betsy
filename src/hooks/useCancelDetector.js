import { useEffect, useRef } from 'react'
import { useKeyListener } from './useKeyListener'

function useCancelDetector(callback, exclusions) {
    const ref = useRef(null)
    useKeyListener(['Escape'], () => callback())

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target) && (exclusions ? !exclusions.some(exclusion => document.getElementById(exclusion).contains(event.target)) : true)) {
                callback()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [ref, callback])

    return ref
}

export { useCancelDetector }