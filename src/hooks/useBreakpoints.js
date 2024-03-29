import { useEffect, useState } from 'react'
import _ from 'lodash'

function useBreakpoints() {
    const points = [640, 768, 1024]
    const [isClient, setIsClient] = useState()
    const [breakPoints, setBreakPoints] = useState([false, false, false])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClient(true)
        }
    }, [])

    useEffect(() => {
        if (isClient) {
            function getWidth() {
                const { innerWidth: width } = window
                return width
            }

            function handleResize() {
                const width = getWidth()
                const newBreakpoints = [false, false, false]
                for (let i = 0; i < breakPoints.length; i++) {
                    if (i === 0) {
                        if (width < points[i + 1]) {
                            newBreakpoints[i] = true
                        }
                    }
                    else if (i === breakPoints.length - 1) {
                        if (width >= points[i]) {
                            newBreakpoints[i] = true
                        }
                    }
                    else {
                        if ((width >= points[i]) && (width < points[i + 1])) {
                            newBreakpoints[i] = true
                        }
                    }
                }
                if (!_.isEqual(newBreakpoints, breakPoints)) {
                    setBreakPoints(newBreakpoints)
                }
            }

            handleResize()
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [isClient, breakPoints])
    
    return (isClient ? breakPoints : [false, false, false])
}

export { useBreakpoints }