import { useEffect, useState } from 'react'
import { getAllUsers } from '../lib/getAllUsers'

function useData() {
    const [data, setData] = useState()

    useEffect(() => {
        async function initialize() {
            const users = (await getAllUsers()).users
            setData({
                Sports: [],
                Competitions: [],
                Events: [],
                Competitors: [],
                Users: users
            })
        }

        if (!data) {
            initialize()
        }
    }, [])
    
    return data
}

export { useData }