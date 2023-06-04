import { useEffect, useState } from 'react'

function useStatuses(list) {
    const [statuses, setStatuses] = useState()

    useEffect(() => {
        if (!statuses) {
            const target = {}
            list.forEach(key => target[key] = {status: null, message: ''})
            setStatuses(target)
        }
    }, [])

    function setStatus(key, status, message) {
        let copy = {...statuses}
        copy[key] = {
            status: status,
            message: message
        }
        setStatuses(copy)
    }

    return [statuses, setStatus]
}

export { useStatuses }