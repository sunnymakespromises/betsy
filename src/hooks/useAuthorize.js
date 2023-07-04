import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import getCurrentUser from '../lib/auth/getCurrentUser'
import getRefreshToken from '../lib/auth/getRefreshToken'

function useAuthorize() {
    const [user, setUser] = useState()
    const userRef = useRef()
    userRef.current = user
    const [cookies, setCookie, removeCookie] = useCookies(['oauth_refresh_token', 'oauth_source'])
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        async function initial() {
            if (cookies['oauth_refresh_token']) {
                await updateUser()
            }
            else {
                setUser(null)
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

    async function updateUser(category = null, value = null) {
        if (category && value) {
            let newUser = {...userRef.current}
            newUser[category] = value
            setUser(newUser)
        }
        else {
            const { status, message, user } = await getCurrentUser(cookies['oauth_refresh_token'], cookies['oauth_source'])
            setUser(user)
            if (!status) {
                console.log(message)
            }
        }
    }

    const login = useGoogleLogin({
        onSuccess: async (res) => {
            const { status, message, refreshToken } = await getRefreshToken(res.code, 'google')
            if (status) {
                setCookie('oauth_refresh_token', refreshToken)
                const { status, message, user } = await getCurrentUser(refreshToken, 'google')
                setUser(user)
                if (status) {
                    setCookie('oauth_source', 'google')
                    navigate('/')
                }
                else {
                    console.log(message)
                    removeCookie('oauth_source')
                }
            }
            else {
                console.log(message)
                removeCookie('oauth_source')
                removeCookie('oauth_refresh_token')
            }
        },
        onError: (err) => console.log('Login Failed:', err),
        flow: 'auth-code',
        accessType: 'offline'
    })

    const logout = (source) => {
        if (source === 'google') {
            googleLogout()
        }
        setUser(null)
        removeCookie('oauth_source')
        removeCookie('oauth_refresh_token')
        navigate('/login')
    }

    return [user, updateUser, login, logout]
}

export { useAuthorize }