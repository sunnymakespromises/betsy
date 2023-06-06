import { Outlet } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import { RootProvider as Provider } from '../contexts/root'
import { useBreakpoints } from '../hooks/useBreakpoints'
import { useTheme } from '../hooks/useTheme'
import { useAuthorize } from '../hooks/useAuthorize'
import Image from '../components/image'
import Page from '../components/page'
import Text from '../components/text'

export default function Root() {
    const [sm, md, lg] = useBreakpoints()
    const isDarkMode = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [cookies, setCookie, removeCookie] = useCookies()
    const [user, refreshUser, signout, login] = useAuthorize()
    const context = { sm, md, lg, isDarkMode, navigate, location, cookies, setCookie, removeCookie, user, refreshUser, signout, login }

    return (
        <Provider value = {context}>
            {location.pathname !== '/login' ?
            <header className = {'transition-all duration-main ease-in-out flex flex-row justify-center items-center h-16 w-full'}>
                <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'h-[80%] aspect-[2.4] cursor-pointer'  onClick = {() => navigate('/home')}/>
            </header>:null}
            <div id = 'body' className = 'transition-all duration-main ease-in-out w-full h-full flex flex-col items-center justify-center px-4 pb-4 md:px-8 md:pb-8'>
                <Page id = 'page' fill = {location.pathname === '/login' ? false : true}>
                    <Outlet/>
                </Page>
            </div>
            <div className = 'w-full flex flex-row justify-center mb-2'>
                <Text classes = '!text-sm !text-light-0'>
                    betsy v0.1.0
                </Text>
            </div>
        </Provider>
    )
}