import { Link } from 'react-router-dom'
import { HomeProvider as Provider, useHomeContext } from '../contexts/home'
import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import { FaAngleRight } from '@react-icons/all-files/fa/FaAngleRight'
import Image from '../components/image'


export default function Home() {
    const { sm } = useRootContext()
    const context = {}

    //slips, wallet, stats, profile, settings
    return (
        <Provider value = {context}>
            <div id = 'home-page' className = 'w-full h-full flex flex-row gap-4 md:gap-8'>
                <Helmet><title>dashboard | betsy</title></Helmet>
                <Group direction = 'vertical' classes = 'w-[50%]'>
                    <Slips/>
                    <Stats/>
                </Group>
                <Group direction = 'vertical' classes = 'w-[50%]'>
                    <Wallet/>
                    <Group direction = {sm ? 'vertical' : 'horizontal'} classes = 'h-[50%]'>
                        <Users/>
                        <Profile/>
                    </Group>
                    <Settings/>
                </Group>
            </div>
        </Provider>
    )
}

function Slips() {
    return (
        <Panel path = '/slips' title = 'slips' classes = 'h-[50%]'>

        </Panel>
    )
}

function Stats() {
    return (
        <Panel path = '/stats' title = 'stats' classes = 'h-[50%]'>

        </Panel>
    )
}

function Wallet() {
    return (
        <Panel path = '/wallet' title = 'wallet' classes = 'grow'>

        </Panel>
    )
}

function Users() {
    return (
        <Panel path = '/users' title = 'users' classes = 'h-[50%] w-full md:w-[50%] md:h-full'>

        </Panel>
    )
}

function Profile() {
    const { currentUser } = useRootContext()

    return (
        <Panel path = {'/users?user=' + currentUser?.username} title = {currentUser?.username} classes = 'h-[50%] w-full md:w-[50%] md:h-full'>
            <div className = 'w-full h-full flex flex-col justify-center items-center p-0 md:p-4'>
                <Image id = 'home-panel-profile-image' external path = {currentUser?.picture} classes = 'h-full w-min md:w-full md:h-min aspect-square rounded-full shadow-main'/>
            </div>
        </Panel>
    )
}

function Settings() {
    return (
        <Panel path = '/settings' title = 'settings' classes = 'h-min' container = {false}>
                        
        </Panel>
    )
}

function Group({classes, direction, children}) {
    return (
        <div className = {'home-group transition-all duration-main flex ' + (direction === 'vertical' ? 'flex-col h-full' : 'flex-row w-full') + ' gap-4 md:gap-8' + (classes ? ' ' + classes : '')}>
            {children}
        </div>
    )
}

function Panel({path, title, classes, children}) {
    return (
        <div id = {'home-panel-' + title + '-container'} className = {'home-panel transition-all duration-main w-full flex flex-col gap-2 rounded-main shadow-main p-4 bg-transparent dark:backdrop-brightness-lighter backdrop-brightness-darker' + (classes ? ' ' + classes : '')}>
            <Link to = {path} id = {'home-panel-' + title + '-link'} className = 'home-panel-link transition-all duration-fast flex flex-row items-center gap-1 hover:gap-2'>
                <Text id = {'home-panel-' + title + '-link-text'} classes = '!text-xl md:!text-3xl !font-bold !cursor-pointer opacity-main'>
                    {title}
                </Text>
                <FaAngleRight id = {'home-panel-' + title + '-link-icon'} className = 'w-4 h-4 md:w-6 md:h-6 cursor-pointer opacity-main'/>
            </Link>
            {children}
        </div>
    )
}