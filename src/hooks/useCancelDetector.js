import { useEffect, useRef } from 'react'

function useCancelDetector(callback) {
    const ref = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback()
            }
        }
        function handleKeyPress(event) {
            if (event.key === 'Escape') {
                callback()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyPress)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [ref, callback])

    return ref
}

export { useCancelDetector }