import { useEffect, useRef, useState } from 'react'
import { getData } from '../lib/getData'
import { useLoading } from './useLoading'
import { usePrevious } from './usePrevious'
import _ from 'lodash'

function useData(currentUser) {
    const [data, setData] = useState()
    const [isLoading, execute] = useLoading()
    const dataRef = useRef()
    dataRef.current = data
    let previousCurrentUser = usePrevious(currentUser)
    
    useEffect(() => {
        async function start() {
            if (currentUser) {
                if (!data) {
                    await execute(async () => {
                        await updateData()
                    })
                }
                else if (!_.isEqual(previousCurrentUser?.favorites, currentUser?.favorites)) {
                    await updateData('recommendations')
                }
            }
        }
        
        start()
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
    
    return { data, updateData, isLoading }
}

export { useData }