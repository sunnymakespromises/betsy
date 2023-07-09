import { useEffect, useRef, useState } from 'react'

function useSizeDetector() {
    const ref = useRef()
    const [size, setSize] = useState(0)

    useEffect(() => {
        getSize()
    }, [ref.current?.clientHeight, ref.current?.clientWidth])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        window.addEventListener('resize', getSize)
        return () => window.removeEventListener('resize', getSize)
    }, [])

    function getSize() {
        let style = getComputedStyle(ref?.current)
        setSize({ height: style.height.replace('px', ''), width: style.width.replace('px', '') })
    }

    return [ref, size]
}

export { useSizeDetector }