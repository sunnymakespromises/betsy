import { memo, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useDataContext } from '../contexts/data'
import Page from '../components/page'
import Text from '../components/text'
import { Event } from '../components/events'
import List from '../components/list'
import { useSearch } from '../hooks/useSearch'
import { AlarmRounded, ListAltRounded } from '@mui/icons-material'
import now from '../lib/util/now'
import _ from 'lodash'

const Home = memo(function Home() {
    const { data } = useDataContext()

    let DOMId = 'home-'
    return (
        <Page>
            <div id = {DOMId + 'page'} className = 'w-full h-full'>
                <Helmet><title>Dashboard | Betsy</title></Helmet>
                <div id = {DOMId + 'container'} className = 'w-full h-full min-h-0 flex flex-col md:flex-row gap-small md:gap-main z-0'>
                    <Events data = {data} parentId = {DOMId + 'events-'}/>
                </div>
            </div>
        </Page>
    )
})

const Events = memo(function Events({ data, parentId }) {
    const searchConfig = useMemo(() => { return {
        id: 'competitor',
        filters: {
            live: {
                title: 'Live Events',
                icon: (props) => <AlarmRounded {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events' && r.start_time < now()).sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical']
            },
            has_bets: {
                title: 'Has Bets',
                icon: (props) => <ListAltRounded {...props}/>,
                fn: (a, category) => a.filter(r => category === 'events' && r.odds && r.odds.length > 0).sort((a, b) => a.start_time - b.start_time)
            }
        },
        space: { events: data.recommendations.favorites },
        categories: ['events'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
        showAllOnInitial: true
    }}, [data])
    const { results } = useSearch(searchConfig)
    let DOMId = parentId + 'panel-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full min-h-0 flex flex-col rounded-main border-thin border-divider-main md:shadow'>
            <div id = {DOMId + 'title-container'} className = 'w-full h-min flex flex-row items-center p-main'>
                <Text id = {DOMId + 'title'} preset = 'home-panel'>
                    Events
                </Text>
                {/* <SearchBar input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {false} canExpand = {false} parentId = {DOMId}/> */}
            </div>
            <div className = 'divider border-t-thin border-divider-main'/>
            <div id = {DOMId + 'child-container'} className = 'min-h-0 w-full'>
                <List items = {results} element = {Event} dividers parentId = {DOMId + 'events-'}/>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.data, a.data))

export default Home