import { useEffect, useRef, useState } from 'react'

function useSizeDetector(id = null) {
    const ref = useRef()
    const [size, setSize] = useState(0)

    useEffect(() => {
        getSize()
    }, [ref.current?.clientHeight, ref.current?.clientWidth, ref.current?.clientTop, ref.current?.clientLeft])

    useEffect(() => {
        if (id) {
            ref.current = document.getElementById(id)
        }
    }, [id])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }
        window.addEventListener('resize', getSize)
        return () => window.removeEventListener('resize', getSize)
    }, [])

    function getSize() {
        let rect = ref?.current ? ref.current.getBoundingClientRect() : {}
        setSize({ height: rect.height, width: rect.width, top: rect.top, left: rect.left, bottom: rect.top + rect.height, right: rect.left + rect.width })
    }

    return [ref, size]
}

export { useSizeDetector }