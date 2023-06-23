import React, { useEffect, useState } from 'react'
import { useDatabase } from '../../hooks/useDatabase'

export default function Dashboard() {
    const { getLogs } = useDatabase()
    const [logs, setLogs] = useState()

    useEffect(() => {
        
    }, [])

    return (
        <div id = 'dev-logs-page' className = 'w-full h-full flex flex-col md:flex-row gap-smaller'>
            
        </div>
    )
}