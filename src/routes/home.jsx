import { Helmet } from 'react-helmet'
import { HomeProvider as Provider } from '../contexts/home'
import Text from '../components/text'
import Page from '../components/page'
import Conditional from '../components/conditional'

export default function Home() {
    const context = {}
    return (
        <Provider value = {context}>
            <Page>
                <div id = 'home-page' className = 'w-full h-full flex flex-col md:flex-row gap-smaller md:gap-main'>
                    <Helmet><title>Dashboard | Betsy</title></Helmet>
                    <Group direction = 'vertical' classes = 'w-full md:w-[50%]'>
                        <ActiveSlips/>
                    </Group>
                    <Group direction = 'vertical' classes = 'w-full md:w-[50%]'>
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
        <div className = {'home-group flex ' + (direction === 'vertical' ? 'flex-col' : 'flex-row') + ' gap-smaller md:gap-main' + (classes ? ' ' + classes : '')}>
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