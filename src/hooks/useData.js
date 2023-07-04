import { useEffect, useRef, useState } from 'react'
import { getData } from '../lib/getData'

function useData(currentUser) {
    const [data, setData] = useState()
    const dataRef = useRef()
    dataRef.current = data
    
    useEffect(() => {
        if (currentUser && !data) {
            updateData()
        }
    }, [currentUser])

    async function updateData(category = null) {
        const { statuses, data, messages } = (await getData(category, currentUser))
        if (category) {
            let newData = {...dataRef.current, ...data}
            setData(newData)
        }
        else {
            if (statuses.all) {
                setData(data)
            }
            else {
                for (const category of Object.keys(messages)) {
                    console.log(messages[category])
                }
            }
        }
    }
    
    return { data, updateData }
}

export { useData }