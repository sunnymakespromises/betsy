import { useUserContext } from '../contexts/user'
import { useEffect } from 'react'

export default function Logout() {
    const { logout } = useUserContext()

    useEffect(() => {
        logout()
    }, [logout])

    return (
        <></>
    )
}