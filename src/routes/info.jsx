import React, { memo, useEffect, useMemo, useState } from 'react'
import Page from '../components/page'
import { Helmet } from 'react-helmet'
import { Link, useSearchParams } from 'react-router-dom'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useDatabase } from '../hooks/useDatabase'
import Conditional from '../components/conditional'
import Text from '../components/text'
import Map from '../components/map'
import now from '../lib/util/now'
import { useFavorite } from '../hooks/useFavorite'
import { Event as EventItem } from '../components/events'
import toDate from '../lib/util/toDate'
import Image from '../components/image'
import { AlarmRounded, CircleRounded, ListAltRounded } from '@mui/icons-material'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/searchBar'
import List from '../components/list'
import Odds from '../components/odds'

const Info = memo(function Info() {
    let [searchParams,] = useSearchParams()
    const { data } = useDataContext()
    let { getItem } = useDatabase()
    let category = useMemo(() => searchParams.get('category') ? searchParams.get('category') : null, [searchParams])
    let id = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])
    let [item, setItem] = useState()

    useEffect(() => {
        async function updateUser() {
            let { item } = await getItem(category, id)
            setItem(item)
        }

        updateUser()
    }, [category, id])

    let DOMId = 'info'
    return (
        <Page parentId = {DOMId}>
            <Helmet><title>{(item ? item.name : 'Info') + ' | Betsy'}</title></Helmet>
            <Item category = {category} item = {item} data = {data} parentId = {DOMId}/>
            <Conditional value = {item === null}>
                <ErrorScreen category = {category} parentId = {DOMId}/>
            </Conditional>
        </Page>
    )
})

const Item = memo(function Item({ category, item, data, parentId }) {
    if (item) {
        switch (category) {
            case 'events':
                return <Event event = {item} parentId = {parentId}/>
            case 'competitions':
                return <Competition competition = {item} data = {data} parentId = {parentId}/>
            case 'competitors':
                return <Competitor competitor = {item} data = {data} parentId = {parentId}/>
            default:
                return <></>
        }
    }
}, (b, a) => _.isEqual(b.item, a.item) && _.isEqual(b.data, a.data))

const Event = memo(function Event({ event, parentId }) {
    // const isLive = useMemo(() => event.start_time < now(), [event])
    // const searchConfig = useMemo(() => { return {
    //     id: 'event',
    //     space: { },
    //     categories: [],
    //     keys: { },
    //     showAllOnInitial: true
    // }}, [event])
    // const { input, results, hasResults, filters, setFilter, onInputChange } = useSearch(searchConfig)
    let DOMId = parentId + '-event'
    return (
        <div id = {DOMId} className = 'w-full h-full flex flex-col gap-main'>
            <div id = {DOMId + '-bar'} className = 'grow flex flex-row justify-between items-center'>
                <Title name = {event.name} category = 'events' item = {event} parentId = {DOMId}/>
                {/* <SearchBar inputPreset = 'info' classes = 'w-1/3' input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {true} canExpand = {false} parentId = {DOMId}/> */}
            </div>
            <div id = {DOMId + '-data'} className = 'w-full md:w-[28rem] min-h-0 h-full flex flex-row gap-main'>
                <Panel title = 'Odds' classes = 'h-full w-full' parentId = {DOMId + '-odds'}>
                    <Conditional value = {!event.odds || event.odds?.length < 1}>
                        <div id = {DOMId + '-odds-not-found'} className = 'w-full h-full flex justify-center items-center'>
                            <Text preset = 'info-notFound'>
                                No odds found.
                            </Text>
                        </div>
                    </Conditional>
                    <Conditional value = {event.odds?.length > 0}>
                        <Odds event = {event} classes = 'h-min p-main' parentId = {DOMId}/>
                    </Conditional>
                </Panel>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event))

const Competition = memo(function Competition({ competition, data, parentId }) {
    let events = useMemo(() => competition.events.length > 0 ? competition.events.map(e => data.events.find(event => event.id === e.id)).sort((a, b) => a.start_time - b.start_time) : [], [data, competition])
    const searchConfig = useMemo(() => { return {
        id: 'competition',
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
        space: { events: events },
        categories: ['events'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
        showAllOnInitial: true
    }}, [data, events])
    const { input, results, hasResults, filters, setFilter, onInputChange } = useSearch(searchConfig)

    let DOMId = parentId + '-competition'
    return (
        <div id = {DOMId } className = 'w-full h-full flex flex-col gap-main'>
            <div id = {DOMId + '-bar'} className = 'grow flex flex-row justify-between'>
                <Title name = {competition.name} category = 'competitions' item = {competition} parentId = {DOMId}/>
                <SearchBar inputPreset = 'info' classes = 'w-1/3' input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {true} canExpand = {false} parentId = {DOMId}/>
            </div>
            <div id = {DOMId + '-data'} className = 'w-full md:w-[28rem] min-h-0 h-full flex flex-row gap-main'>
                <Panel title = 'Events' classes = 'h-full w-full' parentId = {DOMId + '-events'}>
                    <Conditional value = {results?.events?.length > 0}>
                        <List items = {results?.events} element = {EventItem} dividers parentId = {DOMId + '-events'}/>
                    </Conditional>
                    <Conditional value = {results?.events?.length < 1}>
                        <div id = {DOMId + '-event-not-found'} className = 'w-full h-full flex justify-center items-center'>
                            <Text preset = 'info-notFound'>
                                No events found.
                            </Text>
                        </div>
                    </Conditional>
                </Panel>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.competition, a.competition) && _.isEqual(b.data, a.data))

const Competitor = memo(function Competitors({ data, competitor, parentId }) {
    let events = useMemo(() => competitor.events.length > 0 && competitor.events.map(e => data.events.find(event => event.id === e.id)).sort((a, b) => a.start_time - b.start_time), [data, competitor])
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
        space: { events: events },
        categories: ['events'],
        keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
        showAllOnInitial: true
    }}, [data, events])
    const { input, results, hasResults, filters, setFilter, onInputChange } = useSearch(searchConfig)

    let DOMId = parentId + '-competitor'
    return (
        <div id = {DOMId} className = 'w-full h-full flex flex-col gap-main'>
            <div id = {DOMId + '-bar'} className = 'grow flex flex-row justify-between'>
                <Title name = {competitor.name} category = 'competitors' item = {competitor} parentId = {DOMId}/>
                <SearchBar inputPreset = 'info' classes = 'w-1/3' input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {true} canExpand = {false} parentId = {DOMId}/>
            </div>
            <div id = {DOMId + '-data'} className = 'w-full md:w-[28rem] min-h-0 h-full flex flex-row gap-main'>
                <Panel title = 'Events' classes = 'h-full w-full' parentId = {DOMId + '-events'}>
                    <List items = {results?.events} element = {EventItem} dividers parentId = {DOMId}/>
                </Panel>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.data, a.data) && _.isEqual(b.competitor, a.competitor))

const Panel = memo(function Panel({ title, classes, parentId, children }) {
    let DOMId = parentId + '-panel'
    return (
        <div id = {DOMId} className = {'min-h-0 flex flex-col rounded-main border-thin border-divider-main md:shadow' + (classes ? ' ' + classes : '')}>
            <Text id = {DOMId + '-title'} preset = 'info-panel' classes = 'w-full h-min flex flex-row items-center p-main'>
                {title}
            </Text>
            <div className = 'border-t-thin border-divider-main'/>
            {children}
        </div>
    )
})

const Title = memo(function Title({ name, category, item, parentId }) {
    let { isFavorite, Favorite } = useFavorite(category, item)
    let title = useMemo(() => {
        let DOMId = parentId + '-title'
        if (category === 'competitors' || category === 'competitions') {
            return (
                <>
                    <Conditional value = {item.picture}>
                        <Image id = {DOMId + '-image'} external path = {item.picture} classes = 'h-5 aspect-square'/>
                    </Conditional>
                    <Text id = {DOMId + '-name'} preset = 'info-item-title'>
                        {name}
                    </Text>
                    <Favorite isFavorite = {isFavorite} canEdit classes = '!h-5' parentId = {DOMId}/>
                </>
            )
        }
        else if (category === 'events') {
            const isLive = item.start_time < now()
            if (item.is_outright) {
                return <Text id = {DOMId + '-name'} preset = 'info-item-title'>{name}</Text>
            }
            else {
                if (item.competitors) {
                    return (
                    <>
                        <Conditional value = {isLive}>
                            <CircleRounded id = {DOMId + '-live-icon'} className = '!h-3 !w-3 text-live-main'/>
                        </Conditional>
                        <div id = {DOMId + '-competitor1'} className = 'flex flex-row items-center gap-tiny'>
                            <Conditional value = {item.competitors[0].picture}>
                                <Image id = {DOMId + '-competitor1-image'} external path = {item.competitors[0].picture} classes = 'h-5 aspect-square'/>
                            </Conditional>
                            <Link to = {'/info?category=competitors&id=' + item.competitors[0].id} id = {DOMId + '-competitor1-link'}>
                                <Text id = {DOMId + '-competitor1-name'} preset = 'info-item-title' classes = '!text-primary-main'>
                                    {item.competitors[0].name}
                                </Text>
                            </Link>
                        </div>
                        <Text id = {DOMId + '-separator'} preset = 'info-item-title'>
                            {name.includes('@') ? '@' : 'v'}
                        </Text>
                        <div id = {DOMId + '-competitor2'} className = 'flex flex-row items-center gap-tiny'>
                            <Conditional value = {item.competitors[1].picture}>
                                <Image id = {DOMId + '-competitor2-image'} external path = {item.competitors[1].picture} classes = 'h-5 aspect-square'/>
                            </Conditional>
                            <Link to = {'/info?category=competitors&id=' + item.competitors[1].id} id = {DOMId + '-competitor2-link'}>
                                <Text id = {DOMId + '-competitor2-name'} preset = 'info-item-title' classes = '!text-primary-main'>
                                    {item.competitors[1].name}
                                </Text>
                            </Link>
                        </div>
                    </>
                )}
            }
        }
    }, [name, category, item, isFavorite])
    let subtitle = useMemo(() => {
        let DOMId = parentId + '-subtitle'
        if (category === 'competitors') {
            return (
                <>
                    <Text id = {DOMId + '-intro'} preset = 'info-item-subtitle'>
                        Plays&nbsp;{item.sport.name}&nbsp;in the&nbsp;
                    </Text>
                    <Map array = {item.competitions} callback = {(competition, index) => {
                        let prefix = index === 0 ? '' : index !== item.competitions.length - 1 ? ',' : item.competitions.length > 1 ? ', and' : ''
                        let suffix = (index === item.competitions.length - 1 ? '.' : ' ')
                        let competitionId = DOMId + '-competition' + index; return (
                        <React.Fragment key = {index}>
                            <Conditional value = {prefix !== ''}>
                                <Text id = {competitionId + '-prefix'} preset = 'info-item-subtitle'>
                                    {prefix}&nbsp;
                                </Text>
                            </Conditional>
                            <div id = {competitionId + '-competition'} className = 'flex flex-row items-center gap-tiny'>
                                <Conditional value = {competition.picture}>
                                    <Image id = {competitionId + '-competition-image'} external path = {competition.picture} classes = 'h-3 aspect-square'/>
                                </Conditional>
                                <Link to = {'/info?category=competitions&id=' + competition.id} id = {competitionId + 'competition-link'}>
                                    <Text id = {competitionId + '-competition-name'} preset = 'info-item-subtitle' classes = '!text-primary-main'>
                                        {competition.name}
                                    </Text>
                                </Link>
                            </div>
                            <Conditional value = {suffix !== ''}>
                                <Text id = {competitionId + '-suffix'} preset = 'info-item-subtitle'>
                                    {suffix}
                                </Text>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </>
            )
        }
        else if (category === 'events') {
            const isLive = item.start_time < now()
            return (
                <>
                    <Text id = {DOMId + '-intro'} preset = 'info-item-subtitle'>
                        {isLive ? 'Being' : 'To be'}&nbsp;played in the&nbsp;
                    </Text>
                    <div id = {DOMId + '-competition'} className = 'flex flex-row items-center gap-tiny'>
                        <Conditional value = {item.competition.picture}>
                            <Image id = {DOMId + '-competition-image'} external path = {item.competition.picture} classes = 'h-3 aspect-square'/>
                        </Conditional>
                        <Link to = {'/info?category=competitions&id=' + item.competition.id} id = {DOMId + '-competition-link'}>
                            <Text id = {DOMId + '-competition-name'} preset = 'info-item-subtitle' classes = '!text-primary-main'>
                                {item.competition.name}
                            </Text>
                        </Link>
                    </div>
                    <Text id = {DOMId + '-date'} preset = 'info-item-subtitle'>
                        &nbsp;{'at ' + toDate(item.start_time) + '.'}
                    </Text>
                </>
            )
        }
        else {
            return (
                <>
                    <Text id = {DOMId + '-intro'} preset = 'info-item-subtitle'>
                        Hosts&nbsp;{item.sport.name}&nbsp;in&nbsp;
                    </Text>
                    <div id = {DOMId + '-country'} className = 'flex flex-row items-center gap-tiny'>
                        <Text id = {DOMId + '-country-name'} preset = 'info-item-subtitle'>
                            {item.country.name}
                        </Text>
                        <Conditional value = {item.country.picture}>
                            <Image id = {DOMId + '-country-image'} external path = {item.country.picture} classes = 'h-3 aspect-square'/>
                        </Conditional>
                    </div>
                </>
            )
        }
    }, [name, category, item])
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'w-min flex flex-col'>
            <div id = {DOMId + '-title'} className = 'w-min flex flex-row items-center gap-tiny'>
                {title}
            </div>
            <div id = {DOMId + '-subtitle'} className = 'w-min flex flex-row items-center'>
                {subtitle}
            </div>
        </div>
    )
}, (b, a) => b.name === a.name && b.category === a.category && _.isEqual(b.item, a.item))

const ErrorScreen = memo(function ErrorScreen({ category, parentId }) {
    let message = useMemo(() => {
        switch (category) {
            case 'events':
                return 'This event either does not exist, or has already ended.'
            case 'competitors':
                return 'This competitor does not exist.'
            case 'competitions':
                return 'This competition does not exist.'
            default:
                return 'This ' + category + ' cannot be found.'
        }
    }, [category])
    let DOMId = parentId + '-error'
    return (
        <div id = {DOMId} className = 'w-full h-full backdrop-blur-main z-20'>
            <div id = {DOMId + '-banner'} className = 'w-full h-min bg-primary-main rounded-main p-main !animate-duration-300 animate-slideInDown'>
                <Text id = {DOMId + '-message'} preset = 'info-error'>
                    {message}
                </Text>
            </div>
        </div>
    )
})

export default Info