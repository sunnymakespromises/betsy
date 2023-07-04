import _ from 'lodash'
import { useMemo, useRef, useState } from 'react'

function useStatuses(list) {
    const [statuses, setStatuses] = useState(getEmptyStatuses())
    const statusesAreEmpty = useMemo(() => _.isEqual(statuses, getEmptyStatuses()), [statuses])
    const statusesRef = useRef()
    statusesRef.current = statuses

    function setAllStatuses(newStatuses, duration = null) {
        setStatuses({...newStatuses})
        if (duration) {
            setTimeout(() => {
                setStatuses(getEmptyStatuses())
            }, duration)
        }
    }

    function getEmptyStatuses() {
        const empty = {}
        list.forEach(key => empty[key] = {status: null, message: ''})
        return empty
    }

    function clearAllStatuses() {
        setStatuses(getEmptyStatuses)
    }

    function setStatus(key, status, message, duration = null) {
        let newStatuses = {...statusesRef.current}
        newStatuses[key] = { status: status, message: message }
        setStatuses(newStatuses)
        if (duration) {
            setTimeout(() => {
                let newStatuses = {...statusesRef.current}
                newStatuses[key] = { status: null, message: '' }
                setStatuses(newStatuses)
            }, duration)
        }
    }

    return { statuses, setStatuses: setAllStatuses, setStatus, clearAllStatuses, statusesAreEmpty }
}

export { useStatuses }