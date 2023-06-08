import { Link } from 'react-router-dom'
import { HomeProvider as Provider, useHomeContext } from '../contexts/home'
import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import { FaAngleRight } from '@react-icons/all-files/fa/FaAngleRight'


export default function Home() {
    const { currentUser, navigate } = useRootContext()
    const context = {}

    //slips, wallet, stats, profile, settings
    return (
        <Provider value = {context}>
            <div id = 'home-page' className = 'w-full h-full flex flex-row gap-4'>
                <Helmet><title>dashboard | betsy</title></Helmet>
                <Group direction = 'vertical' classes = 'w-[50%]'>
                    <Slips/>
                    <Stats/>
                </Group>
                <Group direction = 'vertical' classes = 'w-[50%]'>
                    <Wallet/>
                    <Group direction = 'horizontal' classes = 'h-[30%]'>
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
        <Panel path = '/wallet' title = 'wallet' classes = 'h-[40%]'>

        </Panel>
    )
}

function Users() {
    return (
        <Panel path = '/users' title = 'users' classes = 'w-[50%]'>

        </Panel>
    )
}

function Profile() {
    const { currentUser } = useRootContext()
    return (
        <Panel path = {'/users?user=' + currentUser?.username} title = 'profile' classes = 'w-[50%]'>
                            
        </Panel>
    )
}

function Settings() {
    return (
        <Panel path = '/settings' title = 'settings' classes = 'h-[20%]'>
                        
        </Panel>
    )
}

function Group({classes, direction, children}) {
    return (
        <div className = {'home-group flex ' + (direction === 'vertical' ? 'flex-col' : 'flex-row') + ' h-full gap-4' + (classes ? ' ' + classes : '')}>
            {children}
        </div>
    )
}

function Panel({path, title, classes, children}) {
    return (
        <div id = {'home-panel-' + title} className = {'home-panel w-full flex flex-col' + (classes ? ' ' + classes : '')}>
            <Link to = {path} id = {'home-panel-' + title + '-link'} className = 'home-panel-link transition-all duration-fast flex flex-row items-center gap-1 hover:gap-2'>
                <Text id = {'home-panel-' + title + '-link-text'} classes = '!font-bold !cursor-pointer opacity-main'>
                    {title}
                </Text>
                <FaAngleRight id = {'home-panel-' + title + '-link-icon'} className = 'w-6 h-6 cursor-pointer opacity-main'/>
            </Link>
            {children}
        </div>
    )
}