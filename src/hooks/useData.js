import { useEffect, useState } from 'react'
import { getData } from '../lib/getData'

function useData() {
    const [data, setData] = useState()

    async function initialize() {
        const data = (await getData())
        setData(data.data)
    }
    
    useEffect(() => {
        if (!data) {
            initialize()
        }
    }, [])

    function refreshData() {
        initialize()
    }
    
    return { data, refreshData }
}

export { useData }