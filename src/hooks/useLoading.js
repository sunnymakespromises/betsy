import { useEffect, useState } from 'react'

function useLoading() {
    const [isLoading, setIsLoading] = useState(false)
    let [globalFn, setGlobalFn] = useState(() => async () => null)

    useEffect(() => {
        async function executeFn() {
            await globalFn()
            setIsLoading(false)
        }

        if (isLoading) {
            executeFn()
        }
    }, [isLoading])

    async function execute(fn) {
        setGlobalFn(() => fn)
        setIsLoading(true)
    }
    
    return [isLoading, execute]
}

export { useLoading }