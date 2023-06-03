import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { RootProvider as Provider } from '../contexts/root'
import { useBreakpoints } from '../hooks/useBreakpoints'
import { useTheme } from '../hooks/useTheme'
import { useCookies } from 'react-cookie'
import { useEffect, useState } from 'react'
import Image from '../components/image'
import getUser from '../lib/getUser'

export default function Root() {
    const navigate = useNavigate()
    const location = useLocation()
    const [sm, md, lg] = useBreakpoints()
    const isDarkMode = useTheme()
    const [cookies, setCookie, removeCookie] = useCookies()
    const [user, setUser] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [isNewUser, setIsNewUser] = useState(false)
    const context = { sm, md, lg, isDarkMode, setCookie, removeCookie, navigate, user, setUser, isNewUser, setIsNewUser, refreshToken, setRefreshToken }

    function upkeep() {
        if (cookies['oauth-refresh-token']) {
            setRefreshToken(cookies['oauth-refresh-token'])
        }
        if (cookies['user']) {
            setUser(cookies['user'])
        }
        else {
            getUser(cookies['oauth-refresh-token'], setUser, setCookie, removeCookie, setIsNewUser)
        }
    }

    useEffect(() => {
        upkeep()
    }, [])

    useEffect(() => {
        if (location.pathname === '/') {
            navigate(user ? '/home' : '/login')
        }
    }, [location])

    useEffect(() => {
        upkeep()
    }, [refreshToken])

    useEffect(() => {
        function route() {
            if (user === null) {
                navigate('/login')
            }
            else {
                if (isNewUser) {
                    navigate('/settings#favorites')
                    setIsNewUser(false)
                }
            }
        }

        route()
    }, [user])

    return (
        <Provider value = {context}>
            <header className = 'transition-[height] flex flex-row w-full h-16 md:h-20 pt-4 pl-4'>
                <Link to = {'/home'}>
                    <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'h-full aspect-[2.4]'/>
                </Link>
            </header>
            <div id = 'body' className = 'w-full h-full'>
                <Outlet/>
            </div>
        </Provider>
    )
}