import { useEffect, useState } from 'react'

function useLoader() {
    const [isLoading, setIsLoading] = useState(false)

    async function execute(fn) {
        setIsLoading(true)
        await fn()
        setIsLoading(false)
    }
    
    return [isLoading, execute]
}

export { useLoader }