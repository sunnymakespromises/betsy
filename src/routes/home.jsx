import React, { memo, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { CalendarWeekFill, Stack, StopwatchFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useSearch } from '../hooks/useSearch'
import Page from '../components/page'
import Text from '../components/text'
import Conditional from '../components/conditional'
import { Event } from '../components/events'
import Map from '../components/map'
import now from '../lib/util/now'
import Panel from '../components/panel'

const Home = memo(function Home() {
    const { data } = useDataContext()

    let DOMId = 'home'
    return (
        <Page canScroll DOMId = {DOMId}>
            <div id = {DOMId} className = 'w-full h-full'>
                <Helmet><title>Dashboard • Betsy</title></Helmet>
                <div id = {DOMId + '-body'} className = 'w-full h-full flex flex-col pb-main'>
                    <Events data = {data} parentId = {DOMId + '-body'}/>
                </div>
            </div>
        </Page>
    )
})

const Events = memo(function Events({ data, parentId }) {
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
                fn: (a, category) => a.filter(r => category === 'events' && r.bets && r.bets.length > 0).sort((a, b) => b.start_time - a.start_time)
            }
        },
        space: { events: data.recommendations.favorites },
        categories: ['events'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
        showAllOnInitial: true
    }}, [data])
    const search = useSearch(searchConfig)

    let DOMId = parentId + '-panel'
    return (
        <div id = {DOMId + '-data'} className = 'w-full h-min flex flex-col md:flex-row gap-main p-main'>
            <Panel title = 'Events' icon = {CalendarWeekFill} classes = 'w-full md:w-[32rem]' parentId = {DOMId + '-events'}>
                <Conditional value = {search.results?.events?.length > 0}>
                    <Map items = {search.results?.events} callback = {(event, index) => {
                        let eventId = DOMId + '-event' + index; return (
                        <Event key = {index} item = {event} bets = {event.bets} parentId = {eventId}/>
                    )}}/>
                </Conditional>
                <Conditional value = {search.results?.events?.length < 1}>
                    <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                        No events found.
                    </Text>
                </Conditional>
            </Panel>
        </div>
    )
}, (b, a) => _.isEqual(b.data, a.data))

export default Home