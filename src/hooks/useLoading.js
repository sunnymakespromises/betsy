import { useState } from 'react'

function useLoading() {
    const [isLoading, setIsLoading] = useState(false)

    async function execute(fn) {
        setIsLoading(true)
        await fn()
        setIsLoading(false)
    }
    
    return [isLoading, execute]
}

export { useLoading }