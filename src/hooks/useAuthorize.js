import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import getCurrentUser from '../lib/getCurrentUser'
import getRefreshToken from '../lib/getRefreshToken'

function useAuthorize() {
    const [user, setUser] = useState()
    const [cookies, setCookie, removeCookie] = useCookies()
    const navigate = useNavigate()
    const location = useLocation()

    async function refreshUser() {
        const { status, message, user } = await getCurrentUser(cookies['oauth-refresh-token'])
        setUser(user)
        if (status) {
            setCookie('user', user)
        }
        else {
            console.log(message)
            removeCookie('user')
        }
    }

    useEffect(() => {
        async function initial() {
            if (cookies['user']) {
                setUser(cookies['user'])
            }
            else {
                if (cookies['oauth-refresh-token']) {
                    await refreshUser()
                }
            }
        }

        initial()
    }, [])

    useEffect(() => {
        function route() {
            if (user === null) {
                if (location.pathname !== '/login') {
                    navigate('/login')
                }
            }
            else if (user) {
                if (location.pathname === '/login') {
                    navigate('/home')
                }
            }
        }

        route()
    }, [user])

    const login = useGoogleLogin({
        onSuccess: async (res) => {
            const { status, message, refreshToken } = await getRefreshToken(res.code)
            if (status) {
                setCookie('oauth-refresh-token', refreshToken)
                const { status, message, user } = await getCurrentUser(refreshToken)
                setUser(user)
                if (status) {
                    setCookie('user', user)
                    navigate('/home')
                }
                else {
                    console.log(message)
                    removeCookie('user')
                }
            }
            else {
                console.log(message)
                removeCookie('oauth-refresh-token')
            }
        },
        onError: (err) => console.log('Login Failed:', err),
        flow: 'auth-code',
        accessType: 'offline'
    })

    const signout = () => {
        googleLogout()
        removeCookie('user')
        setUser(null)
        removeCookie('oauth-refresh-token')
        navigate('/login')
    }

    return [ user, refreshUser, signout, login ]
}

export { useAuthorize }