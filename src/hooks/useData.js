import { useEffect, useState } from 'react'
import { getData } from '../lib/getData'

function useData() {
    const [data, setData] = useState()

    useEffect(() => {
        async function initialize() {
            const data = (await getData())
            setData(data.data)
            if (!(data.statuses.all)) {
                console.log(data.messages)
            }
        }

        if (!data) {
            initialize()
        }
    }, [])
    
    return data
}

export { useData }