import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { HomeProvider as Provider } from '../contexts/home'
import { useRootContext } from '../contexts/root'
import Text from '../components/text'
import Page from '../components/page'
import Conditional from '../components/conditional'
import Money from '../components/money'

export default function Home() {
    const context = {}
    return (
        <Provider value = {context}>
            <Page>
                <div id = 'home-page' className = 'w-full h-full flex flex-col md:flex-row gap-4 md:gap-8'>
                    <Helmet><title>Dashboard | Betsy</title></Helmet>
                    <Group direction = 'vertical' classes = 'w-full md:w-[50%]'>
                        <ActiveSlips/>
                    </Group>
                    <Group direction = 'vertical' classes = 'w-full md:w-[50%]'>
                        <Wallet/>
                        <PopularBets/>
                    </Group>
                </div>
            </Page>
        </Provider>
    )
}

function ActiveSlips() {
    return (
        <Panel title = 'Active Slips' classes = 'h-full flex flex-col gap-smaller animate__animated animate__slideInLeft'>
            <div className = 'w-full h-full rounded-main backdrop-blur-main'>

            </div>
        </Panel>
    )
}

function Wallet() {
    const { currentUser } = useRootContext()
    return (
        <Panel title = 'Wallet' showTitle = {false}>
            <div id = 'home-panel-Wallet' className = 'w-full h-min flex flex-col items-end animate__animated animate__slideInDown'>
                <Money id = 'home-panel-wallet-main-balance' amount = {currentUser?.balance} textClasses = '!text-7xl md:!text-8xl !font-black w-min text-right'/>
                <Text id = 'home-panel-Wallet-main-delta' classes = '!text-base md:!text-lg text-right'>
                    {'+0% over last week'}
                </Text>
            </div>
        </Panel>
    )
}

function PopularBets() {
    return (
        <Panel title = 'Popular Bets' classes = 'grow flex flex-col items-end gap-smaller animate__animated animate__slideInUp'>
            <div className = 'w-full h-full rounded-main backdrop-blur-main'>

            </div>
        </Panel>
    )
}


function Group({ classes, direction, children }) {
    return (
        <div className = {'home-group flex ' + (direction === 'vertical' ? 'flex-col' : 'flex-row') + ' gap-4 md:gap-8' + (classes ? ' ' + classes : '')}>
            {children}
        </div>
    )
}

function Panel({ title, showTitle = true, classes, children }) {
    return (
        <div id = {'home-panel-' + title + '-container'} className = {'home-panel' + (classes ? ' ' + classes : '')}>
            <Conditional value = {showTitle}>
                <Text id = {'home-panel-' + title + '-link-text'} classes = '!text-xl md:!text-3xl !font-extrabold'>
                    {title}
                </Text>
            </Conditional>
            {children}
        </div>
    )
}