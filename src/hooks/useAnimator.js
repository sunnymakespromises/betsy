import { useEffect, useState } from 'react'

function useAnimator() {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (!loaded) {
            setLoaded(true)
        }
    }, [loaded])

    return loaded
}

export { useAnimator }