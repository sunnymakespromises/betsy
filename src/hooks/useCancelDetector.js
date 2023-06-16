import { useEffect } from 'react'

function useCancelDetector(ref, callback) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback()
            }
        }
        function handleKeyPress(event) {
            console.log(event)
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
    }, [ref])
}

export { useCancelDetector }