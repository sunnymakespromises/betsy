import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import getCurrentUser from '../lib/auth/getCurrentUser'
import getRefreshToken from '../lib/auth/getRefreshToken'

function useAuthorize() {
    const [user, setUser] = useState()
    const [cookies, setCookie, removeCookie] = useCookies()
    const navigate = useNavigate()
    const location = useLocation()

    async function refreshUser() {
        const { status, message, user } = await getCurrentUser(cookies['oauth_refresh_token'], cookies['oauth_source'])
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
                if (cookies['oauth_refresh_token']) {
                    await refreshUser()
                }
                else {
                    setUser(null)
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
                    navigate('/')
                }
            }
        }

        route()
    }, [user])

    const login = useGoogleLogin({
        onSuccess: async (res) => {
            const { status, message, refreshToken } = await getRefreshToken(res.code, 'google')
            if (status) {
                setCookie('oauth_refresh_token', refreshToken)
                const { status, message, user } = await getCurrentUser(refreshToken, 'google')
                setUser(user)
                if (status) {
                    setCookie('user', user)
                    setCookie('oauth_source', 'google')
                    navigate('/')
                }
                else {
                    console.log(message)
                    removeCookie('oauth_source')
                    removeCookie('user')
                }
            }
            else {
                console.log(message)
                removeCookie('oauth_source')
                removeCookie('user')
                removeCookie('oauth_refresh_token')
            }
        },
        onError: (err) => console.log('Login Failed:', err),
        flow: 'auth-code',
        accessType: 'offline'
    })

    const logout = () => {
        googleLogout()
        removeCookie('user')
        setUser(null)
        removeCookie('oauth_source')
        removeCookie('oauth_refresh_token')
        navigate('/login')
    }

    return [ user, refreshUser, login, logout ]
}

export { useAuthorize }