import { useRootContext } from '../contexts/root'
import { useEffect } from 'react'

export default function Logout() {
    const { logout } = useRootContext()

    useEffect(() => {
        logout()
    }, [logout])

    return (
        <>
        </>
    )
}