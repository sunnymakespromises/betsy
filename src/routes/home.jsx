import React, { memo, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { HeartFill, Stack, StopwatchFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useSearch } from '../hooks/useSearch'
import Page from '../components/page'
import Text from '../components/text'
import Conditional from '../components/conditional'
import Map from '../components/map'
import now from '../lib/util/now'
import { Event } from '../components/events'
import { MultiPanel } from '../components/panel'

const Home = memo(function Home() {
    const { data } = useDataContext()

    let DOMId = 'home'
    return (
        <Page canScroll DOMId = {DOMId}>
            <div id = {DOMId} className = 'w-full h-full'>
                <Helmet><title>Dashboard • Betsy</title></Helmet>
                <div id = {DOMId + '-body'} className = 'w-full h-full flex flex-col pb-base'>
                    <Events data = {data} parentId = {DOMId + '-body'}/>
                </div>
            </div>
        </Page>
    )
})

const Events = memo(function Events({ data, parentId }) {
    let DOMId = parentId + '-panel'
    const searchConfig = useMemo(() => { return {
        id: 'home',
        filters: {
            live: {
                title: 'Live Events',
                icon: (props) => <StopwatchFill {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events' && r.start_time < now()).sort((a, b) => b.start_time - a.start_time)
            },
            has_bets: {
                title: 'Has Bets',
                icon: (props) => <Stack {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events' && r.bets.length > 0).sort((a, b) => b.start_time - a.start_time)
            }
        },
        space: { events: data.recommendations.favorites },
        categories: ['events'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
        showAllOnInitial: true
    }}, [data])
    const search = useSearch(searchConfig)
    let panelsConfig = useMemo(() => { return [
        {
            key: 'favorite_events',
            title: 'Favorites',
            icon: HeartFill,
            panelClasses: 'w-full md:w-[32rem]',
            parentId: DOMId + '-events',
            children: 
                <div id = {DOMId + '-events'} className = 'flex flex-col gap-lg'>
                    <Conditional value = {search.results?.events?.length > 0}>
                        <Map items = {search.results?.events} callback = {(event, index) => {
                            let eventId = DOMId + '-event' + index; return (
                            <React.Fragment key = {index}>
                                <Event item = {event} bets = {event.bets} parentId = {eventId}/>
                                <Conditional value = {index !== search.results?.events?.length - 1}>
                                    <div className = 'transition-colors duration-main border-t-sm border-divider-highlight'/>
                                </Conditional>
                            </React.Fragment>
                        )}}/>
                    </Conditional>
                    <Conditional value = {search.results?.events?.length < 1}>
                        <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                            No events found.
                        </Text>
                    </Conditional>
                </div>
        }
    ]}, [search])
    
    return (
        <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
    )
}, (b, a) => _.isEqual(b.data, a.data))

export default Home