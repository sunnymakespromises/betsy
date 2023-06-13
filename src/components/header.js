import { Link } from 'react-router-dom'
import { pages } from '../routes/routes'
import { useWindowContext } from '../contexts/window'
import { useRootContext } from '../contexts/root'
import Image from './image'
import Text from './text'
import Conditional from './conditional'
import Money from './money'

export default function Header() {
    const { sm, isDarkMode } = useWindowContext()
    const { currentUser } = useRootContext()

    return (
        <header id = 'header' className = {(isDarkMode ? 'dark ' : '') + 'transition-all duration-main relative w-full h-[13%] flex z-10 ' + (currentUser ? 'justify-between' : 'justify-center') + ' items-center p-smaller gap-main z-10 animate__animated animate__slideInDown'}>
            <div id = 'header-background' className = 'absolute top-0 left-0 w-full h-full backdrop-blur-main -z-10'/>
            <Logo/>
            <Conditional value = {!sm && currentUser}>
                <Items/>
            </Conditional>
            <Conditional value = {currentUser}>
                <Menu isLandscape = {!sm}/>
            </Conditional>
        </header>
    )
}

function Logo() {
    const { isDarkMode } = useWindowContext()
    const { currentUser } = useRootContext()

    return (
        <Link id = 'header-logo-container' to = {currentUser ? '/' : '/login'} className = 'h-full aspect-[1.054] animate__animated !animate__slow hover:animate__tada'>
            <Image id = 'header-logo' path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'h-full w-full cursor-pointer'/>
        </Link>
    )
}

function Items() {
    const { location } = useWindowContext()

    return (
        <div id = 'header-links-container' className = 'grow h-full flex items-center gap-main'>
            {pages.filter((page) => page.navigation.show).map((page, index) => {
                return (
                    <Item key = {index} title = {page.title} path = {page.path}/>
                )
            })}
        </div>
    )

    function Item({ title, path }) {
        return (
            <Link id = {'header-link-' + title} to = {path}>
                <Text id = {'header-link-' + title + '-text'} classes = {'transition-all duration-main ' + (location.pathname === path ? '!text-opacity-100 ' : '!text-opacity-more-visible ') + '!font-bold cursor-pointer ease-in-out hover:scale-main hover:!text-opacity-100'}>
                    {title}
                </Text>
            </Link>
        )
    }
}

function Menu({ isLandscape }) {
    const { location } = useWindowContext()
    const { currentUser } = useRootContext()

    return (
        <div id = 'header-menu' className = 'relative h-full w-min flex items-center gap-smaller animate__animated animate__slideInRight'>
            <Conditional value = {currentUser}>
                <Link id = 'header-menu-wallet' to = '/wallet' className = 'flex items-center h-full w-min gap-small cursor-pointer'>
                    <Money id = 'header-menu-money' amount = {currentUser?.balance} classes = 'transition-all duration-main hover:scale-main' textClasses = '!font-bold'/>
                </Link>
            </Conditional>

            <div id = 'header-menu-container' className = 'group w-12 h-12'>
                <Image id = 'header-menu-profile-picture' external = {currentUser ? true : false} path = {currentUser?.picture} classes = 'h-full w-full rounded-full cursor-pointer'/>
                <div id = 'header-menu-items-container' className = 'transition-all duration-main absolute top-[100%] right-0 w-full max-h-0 group-hover:max-h-[9999px] overflow-hidden'>
                    <div id = 'header-menu-items' className = 'transition-all duration-main relative w-full h-full px-smaller py-0 group-hover:py-smaller mt-6 backdrop-blur-main rounded-b-main'>
                        <Conditional value = {!isLandscape}>
                            {pages.filter((page) => page.navigation.show).map((page, index) => {
                                return (
                                    <Item key = {index} title = {page.title} path ={page.path}/>
                                )
                            })}
                        </Conditional>
                        <Item title = 'Profile' path = {currentUser ? '/user?username=' + currentUser?.username : '/login'}/>
                        <Item title = 'Settings' path = {currentUser ? '/settings' : '/login'}/>
                        <Item title = 'Logout' path = {currentUser ? '/logout' : '/login'}/>
                    </div>
                </div>
            </div>
        </div>
    )

    function Item({ title, path, onClick }) {
        return (
            <Link id = {'header-menu-item-' + title} to = {path} onClick = {onClick}>
                <Text classes = {'transition-all duration-main ' + (location.pathname === path ? '!text-opacity-100 ' : '!text-opacity-more-visible ') + 'w-min !font-bold cursor-pointer ease-in-out hover:scale-main hover:!text-opacity-100'}>
                    {title}
                </Text>
            </Link>
        )
    }
}