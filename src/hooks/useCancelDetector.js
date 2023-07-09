import { useEffect, useRef } from 'react'
import { useKeyListener } from './useKeyListener'

function useCancelDetector(callback) {
    const ref = useRef(null)
    useKeyListener(['Escape'], () => callback())

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
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