import { memo, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useDataContext } from '../contexts/data'
import { useWindowContext } from '../contexts/window'
import Page from '../components/page'
import Text from '../components/text'
import { useSearch } from '../hooks/useSearch'
import { AlarmRounded, ListAltRounded } from '@mui/icons-material'
import now from '../lib/util/now'
import _ from 'lodash'
import SearchBar from '../components/searchBar'
import Conditional from '../components/conditional'
import { Event } from '../components/events'
import Map from '../components/map'
import React from 'react'

const Home = memo(function Home() {
    const { data } = useDataContext()
    const { isLandscape } = useWindowContext()

    let DOMId = 'home'
    return (
        <Page canScroll DOMId = {DOMId}>
            <div id = {DOMId} className = 'w-full h-full'>
                <Helmet><title>Dashboard | Betsy</title></Helmet>
                <div id = {DOMId + '-body'} className = 'w-full h-full flex flex-col pb-main'>
                    <Events data = {data} isLandscape = {isLandscape} parentId = {DOMId + '-body'}/>
                </div>
            </div>
        </Page>
    )
})

const Events = memo(function Events({ data, isLandscape, parentId }) {
    const searchConfig = useMemo(() => { return {
        id: 'home',
        filters: {
            live: {
                title: 'Live Events',
                icon: (props) => <AlarmRounded {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events' && r.start_time < now()).sort((a, b) => b.start_time - a.start_time)
            },
            has_bets: {
                title: 'Has Bets',
                icon: (props) => <ListAltRounded {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events' && r.bets && r.bets.length > 0).sort((a, b) => b.start_time - a.start_time)
            }
        },
        space: { events: data.recommendations.favorites },
        categories: ['events'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
        showAllOnInitial: true
    }}, [data])
    const { input, results, hasResults, filters, hasActiveFilter, setFilter, onInputChange } = useSearch(searchConfig)

    let DOMId = parentId + '-panel'
    return (
        <div id = {DOMId + '-data'} className = 'w-full h-min flex flex-col md:flex-row gap-main p-main'>
            <Panel title = 'Events' classes = 'w-full md:w-[28rem] min-h-0 h-full' parentId = {DOMId + '-events'}>
                <Conditional value = {results?.events?.length > 0}>
                    <Map array = {results?.events} callback = {(event, index) => {
                        let eventId = DOMId + '-event' + index; return (
                        <React.Fragment key = {index}>
                            <Event item = {event} parentId = {eventId}/>
                            <Conditional value = {index !== results?.events?.length - 1}>
                                <div className = 'border-t-thin border-divider-main'/>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </Conditional>
                <Conditional value = {results?.events?.length < 1}>
                    <div id = {DOMId + '-event-not-found'} className = 'w-full h-full flex p-main'>
                        <Text preset = 'info-notFound'>
                            No events found.
                        </Text>
                    </div>
                </Conditional>
            </Panel>
        </div>
    )
}, (b, a) => b.isLandscape === a.isLandscape && _.isEqual(b.data, a.data))

const Panel = memo(function Panel({ title, classes, parentId, children }) {
    let DOMId = parentId + '-panel'
    return (
        <div id = {DOMId} className = {'flex flex-col rounded-main border-thin border-divider-main shadow-sm md:shadow' + (classes ? ' ' + classes : '')}>
            {/* <Text id = {DOMId + '-title'} preset = 'info-panel' classes = 'w-full h-min flex flex-row items-center p-main'>
                {title}
            </Text>
            <div className = 'border-t-thin border-divider-main'/> */}
            {children}
        </div>
    )
})

export default Home