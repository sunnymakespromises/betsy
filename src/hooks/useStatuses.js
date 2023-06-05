import { useEffect, useState } from 'react'

function useStatuses(list) {
    const [statuses, setStatuses] = useState()

    function initializeStatuses() {
        const target = {}
        list.forEach(key => target[key] = {status: null, message: ''})
        setStatuses(target)
    }

    useEffect(() => {
        if (!statuses) {
            initializeStatuses()
        }
    }, [])

    function clearAllStatuses() {
        initializeStatuses()
    }

    function setStatus(key, status, message) {
        let copy = {...statuses}
        copy[key] = {status: status, message: message}
        setStatuses(copy)
    }

    function clearStatus() {
        const target = {}
        list.forEach(key => target[key] = {status: null, message: ''})
        setStatuses(target)
    }

    return [statuses, setStatus, clearStatus, clearAllStatuses]
}

export { useStatuses }