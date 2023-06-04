import { Link, Outlet } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { RootProvider as Provider } from '../contexts/root'
import { useBreakpoints } from '../hooks/useBreakpoints'
import { useTheme } from '../hooks/useTheme'
import { useAuthorize } from '../hooks/useAuthorize'
import { useDatabase } from '../hooks/useDatabase'
import Image from '../components/image'
import Page from '../components/page'

export default function Root() {
    const navigate = useNavigate()
    const location = useLocation()
    const [sm, md, lg] = useBreakpoints()
    const isDarkMode = useTheme()
    const [user, refreshUser, signout, login] = useAuthorize()
    const [insert, query, update, remove] = useDatabase()
    const context = { sm, md, lg, isDarkMode, navigate, location, user, refreshUser, signout, login, insert, query, update, remove }

    return (
        <Provider value = {context}>
            {location.pathname !== '/login' ?
            <header className = {'transition-all duration-main ease-in-out flex flex-row justify-center items-center h-24 w-full'}>
                <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'h-[80%] aspect-[2.4] cursor-pointer'  onClick = {() => navigate('/home')}/>
            </header>:null}
            <div id = 'body' className = 'transition-all duration-main ease-in-out w-full h-full flex flex-col items-center justify-center px-4 pb-4'>
                <Page id = 'page' fill = {location.pathname === '/login' ? false : true}>
                    <Outlet/>
                </Page>
            </div>
        </Provider>
    )
}