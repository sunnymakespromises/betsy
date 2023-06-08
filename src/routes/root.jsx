import { Outlet, Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import { RootProvider as Provider } from '../contexts/root'
import { useBreakpoints } from '../hooks/useBreakpoints'
import { useTheme } from '../hooks/useTheme'
import { useAuthorize } from '../hooks/useAuthorize'
import Image from '../components/image'

export default function Root() {
    const [sm, md, lg] = useBreakpoints()
    const isDarkMode = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [cookies, setCookie, removeCookie] = useCookies()
    const [currentUser, refreshCurrentUser, signout, login] = useAuthorize()
    const context = { sm, md, lg, isDarkMode, navigate, location, cookies, setCookie, removeCookie, currentUser, refreshCurrentUser, signout, login }

    return (
        <Provider value = {context}>
            <header className = {'transition-all duration-main ease-in-out w-full flex flex-row md:justify-start justify-center items-center pl-8 ' + (location.pathname !== 'login' ? ' h-16 md:h-20' : ' h-0')}>
                <Link to = '/home' className = 'h-[60%] aspect-[2.4]'>
                    <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'h-full w-full cursor-pointer'/>
                </Link>
            </header>
            <div id = 'body' className = 'transition-all duration-main ease-in-out w-full h-full flex flex-col items-center justify-center px-8 pb-8'>
                <div id = 'container' className = {'transition-all duration-main ease-in-out ' + (location.pathname !== '/home' ? 'md:rounded-main md:dark:backdrop-brightness-lighter md:backdrop-brightness-darker px-8 md:py-8 ' : '') + (location.pathname === '/login' || location.pathname === '/settings' ? 'min-w-0 min-h-0' : 'min-w-full min-h-full max-w-full max-h-full')}>
                    <Outlet/>
                </div>
            </div>
        </Provider>
    )
}