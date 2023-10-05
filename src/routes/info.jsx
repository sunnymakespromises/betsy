import React, { memo, useEffect, useMemo, useState } from 'react'
import Page from '../components/page'
import { Helmet } from 'react-helmet'
import { Link, useSearchParams } from 'react-router-dom'
import { BarChartLineFill, CalendarWeekFill, GraphUp, PeopleFill, Stack, StopwatchFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useDatabase } from '../hooks/useDatabase'
import { useFavorite } from '../hooks/useFavorite'
import { useSearch } from '../hooks/useSearch'
import Conditional from '../components/conditional'
import Text from '../components/text'
import Map from '../components/map'
import { MultiPanel } from '../components/panel'
import Bets from '../components/bets'
import SearchBar from '../components/searchBar'
import { default as EventItem } from '../components/event'
import RecentForm from '../components/recentForm'
import Results from '../components/results'
import Image from '../components/image'
import now from '../lib/util/now'
import toDate from '../lib/util/toDate'

const Info = memo(function Info() {
    let DOMId = 'info'
    const ALLOWED_CATEGORIES = ['competitors', 'competitions', 'events']
    let [searchParams,] = useSearchParams()
    const { data } = useDataContext()
    let { getItem } = useDatabase()
    let category = useMemo(() => searchParams.get('category') ? searchParams.get('category') : null, [searchParams])
    let id = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])
    let [item, setItem] = useState()

    useEffect(() => {
        async function updateItem() {
            let { item } = await getItem(category, id)
            setItem(item)
        }

        updateItem()
    }, [category, id])

    return (
        <Page canScroll DOMId = {DOMId}>
            <Helmet><title>{(item ? item.name : 'Info') + ' • Betsy'}</title></Helmet>
            {item && category && ALLOWED_CATEGORIES.includes(category) && <Item category = {category} item = {item} data = {data} parentId = {DOMId}/>}
            <Conditional value = {item === null || !ALLOWED_CATEGORIES.includes(category)}>
                <ErrorScreen category = {category} parentId = {DOMId}/>
            </Conditional>
        </Page>
    )
})

const Item = memo(function Item({ category, item, data, parentId }) {
    let DOMId = useMemo(() => {
        let newDOMId = parentId
        if (category === 'competitions') {
            newDOMId += '-competition'
        }
        else if (category === 'competitors') {
            newDOMId += '-competitor'
        }
        else if (category === 'events') {
            newDOMId += '-event'
        }
        return newDOMId
    }, [category])
    let options = useMemo(() => {return {
        competitions: {
            element: (props) => <Competition {...props} events = {data.events}/>,
            hasSearch: true,
            searchConfig: {
                id: 'info',
                filters: {
                    live: {
                        title: 'Live Events',
                        icon: (props) => <StopwatchFill {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.start_time < now() : true ).sort((a, b) => a.start_time - b.start_time)
                    },
                    has_bets: {
                        title: 'Has Bets',
                        icon: (props) => <Stack {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.bets.length > 0 : true ).sort((a, b) => a.start_time - b.start_time)
                    }
                },
                space: { events: item.events?.length > 0 ? item.events.map(e => data.events.find(event => event.id === e.id)).filter(event => !event.is_completed).sort((a, b) => a.start_time - b.start_time) : [], competitors: item.competitors },
                categories: ['events', 'competitors'],
                keys: { events: ['name', 'competitors.name'], competitors: ['name'] },
                showAllOnInitial: true
            }
        },
        competitors: {
            element: (props) => <Competitor {...props} events = {data.events}/>,
            hasSearch: true,
            searchConfig: {
                id: 'info',
                filters: {
                    live: {
                        title: 'Live Events',
                        icon: (props) => <StopwatchFill {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.start_time < now() : true ).sort((a, b) => a.start_time - b.start_time)
                    },
                    has_bets: {
                        title: 'Has Bets',
                        icon: (props) => <Stack {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.bets.length > 0 : true ).sort((a, b) => a.start_time - b.start_time)
                    }
                },
                space: { events: item.events?.length > 0 ? item.events.map(e => data.events.find(event => event.id === e.id)).filter(event => !(event.is_completed)).sort((a, b) => a.start_time - b.start_time) : [] },
                categories: ['events'],
                keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
                showAllOnInitial: true
            }
        },
        events: {
            element: (props) => <Event {...props} events = {data.events}/>,
            hasSearch: true,
            searchConfig: {
                id: 'info',
                space: { bets: item.bets },
                categories: ['bets'],
                keys: { bets: ['name'] },
                showAllOnInitial: true
            }
        }
    }}, [data, item])
    let option = useMemo(() => {
        return options[category]
    }, [options, category])
    const search = useSearch(option.searchConfig)
    let Element = option.element

    return (
        <div id = {DOMId} className = 'w-full flex flex-col gap-base md:gap-lg'>
            <div id = {DOMId + '-bar'} className = 'flex flex-col md:flex-row justify-between items-center gap-sm p-base bg-base-highlight rounded-base'>
                <Title category = {category} item = {item} parentId = {DOMId}/>
                {option.hasSearch && <SearchBar {...search} classes = 'w-full md:w-1/2' isExpanded = {false} canExpand = {false} parentId = {DOMId}/>}
            </div>
            <div id = {DOMId + '-data'} className = 'w-full h-min flex flex-col md:flex-row gap-base md:gap-lg'>
                <Element results = {search.results} item = {item} parentId = {DOMId}/>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.item, a.item) && _.isEqual(b.data, a.data))

const Competition = memo(function Competition({ results, item: competition, events, parentId }) {
    const CompetitorItem = memo(function Competitor({ item: competitor, parentId }) { 
        let DOMId = parentId

        return (
            <Link id = {DOMId} to = {'/info?category=competitors&id=' + competitor.id} className = 'group/item transition-all duration-main relative w-full aspect-square flex justify-center items-center'>
                <div id = {DOMId + '-image'} className = 'transition-colors duration-main w-full aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main group-hover/item:border-primary-highlight cursor-pointer'>
                    <Conditional value = {competitor.picture}>
                        <Image id = {DOMId + '-image-image'} external path = {competitor.picture} classes = 'w-inscribed aspect-square'/>
                    </Conditional>
                    <Conditional value = {!competitor.picture}>
                        <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted text-center p-base'>
                            {competitor.name}
                        </Text>
                    </Conditional>
                </div>
            </Link>
        )
    })
    let DOMId = parentId

    let panelsConfig = [
        {
            category: 'panel',
            key: 'events',
            icon: CalendarWeekFill,
            panelClasses: 'w-full md:w-[32rem]',
            parentId: DOMId + '-events',
            children: 
                <div id = {DOMId + '-events'} className = 'flex flex-col gap-lg'>
                    <Conditional value = {results?.events?.length > 0}>
                        <Map items = {results?.events} callback = {(event, index) => {
                            let eventId = DOMId + '-event' + index; return (
                            <EventItem key = {index} event = {event} events = {events} parentId = {eventId}/>
                        )}}/>
                    </Conditional>
                    <Conditional value = {results?.events?.length < 1}>
                        <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                            No events found.
                        </Text>
                    </Conditional>
                </div>
        },
        {
            category: 'panel',
            key: 'competitors',
            icon: PeopleFill,
            panelClasses: 'w-full md:grow md:!w-auto',
            parentId: DOMId + '-competitors',
            children: 
                <><Conditional value = {results?.competitors?.length > 0}>
                    <div id = {DOMId + '-competitors'} className = 'w-full h-full grid grid-cols-5 md:grid-cols-8 gap-base'>
                        <Map items = {results?.competitors} callback = {(event, index) => {
                            let competitorId = DOMId + '-competitor' + index; return (
                            <CompetitorItem key = {index} item = {event} parentId = {competitorId}/>
                        )}}/>
                    </div>
                </Conditional>
                <Conditional value = {results?.competitors?.length < 1}>
                    <Text id = {DOMId + '-competitors-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                        No competitors found.
                    </Text>
                </Conditional></>
        }
    ]

    return (
        <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
    )
}, (b, a) => _.isEqual(b.results, a.results) && _.isEqual(b.item, a.item) && _.isEqual(b.events, a.events))

const Competitor = memo(function Competitors({ results, item: competitor, events, parentId }) {
    let DOMId = parentId
    let panelsConfig = [
        {
            category: 'panel',
            key: 'events',
            icon: CalendarWeekFill,
            panelClasses: 'w-full md:w-[32rem]',
            parentId: DOMId + '-events',
            children: 
                <div id = {DOMId + '-events'} className = 'flex flex-col gap-lg'>
                    <Conditional value = {results?.events?.length > 0}>
                        <Map items = {results?.events} callback = {(event, index) => {
                            let eventId = DOMId + '-event' + index; return (
                            <EventItem key = {index} event = {event} events = {events} parentId = {eventId}/>
                        )}}/>
                    </Conditional>
                    <Conditional value = {results?.events?.length < 1}>
                        <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                            No events found.
                        </Text>
                    </Conditional>
                </div>
        },
        {
            category: 'panel',
            key: 'form',
            icon: BarChartLineFill,
            panelClasses: 'w-full md:grow md:!w-auto',
            parentId: DOMId + '-form',
            children: 
                <RecentForm events = {events} competitor = {competitor} parentId = {DOMId}/>
        }
    ]

    return (
        <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
    )
}, (b, a) => _.isEqual(b.results, a.results) && _.isEqual(b.item, a.item) && _.isEqual(b.events, a.events))

const Event = memo(function Event({ item: event, results, events, parentId }) {
    let DOMId = parentId
    let previousMatchups = events.filter(event2 => event2.competitors.includes(event.competitors[0]) && event2.competitors.includes(event.competitors[1]))
    let panelsConfig = [
        {
            category: 'panel',
            key: 'bets',
            icon: Stack,
            panelClasses: 'w-full md:w-[32rem]',
            parentId: DOMId + '-events',
            children: 
                <><Conditional value = {results?.bets?.length > 0}>
                    <Bets event = {event} bets = {results?.bets} events = {events} parentId = {DOMId}/>
                </Conditional>
                <Conditional value = {!event.bets || (event.bets.length < 1)}>
                    <Text id = {DOMId + '-bets-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                        No bets found.
                    </Text>
                </Conditional></>
        },
        {
            category: 'div',
            divId: DOMId + '-right',
            divClasses: 'grow flex flex-col gap-base md:gap-lg',
            children: [
                {
                    category: 'panel',
                    key: 'odds',
                    title: 'Odds',
                    icon: GraphUp,
                    panelClasses: 'w-full',
                    parentId: DOMId + '-odds',
                    children: 
                        <></>
                },
                ...(previousMatchups.length > 0 ? [{
                    category: 'panel',
                    key: 'history',
                    title: 'History',
                    icon: BarChartLineFill,
                    panelClasses: 'w-full',
                    parentId: DOMId + '-history',
                    children: 
                        <Results events = {previousMatchups} parentId = {DOMId + '-history'}/>
                }] : [])
            ]
        }
    ]

    return (
        <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
    )
}, (b, a) => _.isEqual(b.item, a.item) && _.isEqual(b.results, a.results) && _.isEqual(b.events, a.events))

const Title = memo(function Title({ category, item, parentId }) {
    let DOMId = parentId + '-title'
    let [isFavorite, Favorite] = useFavorite(category, item)

    if (category === 'competitors') {
        let competitor = item
        return (
            <div id = {DOMId} className = 'w-full h-min flex items-center gap-xs'>
                <div id = {DOMId + '-image'} className = 'transition-colors duration-main h-8 aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main'>
                    <Conditional value = {!competitor.picture}>
                        <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted'>
                            {competitor.name.substr(0, 1)}
                        </Text>
                    </Conditional>
                    <Conditional value = {competitor.picture}>
                        <Image id = {DOMId + '-image-image'} external path = {competitor.picture} classes = 'w-inscribed aspect-square'/>
                    </Conditional>
                </div>
                <div id = {DOMId + '-name'} className = 'h-full flex flex-col gap-2xs'>
                    <div id = {DOMId + '-name-name'} className = 'flex items-center gap-xs'>
                        <Text id = {DOMId + '-name-name-text'} preset = 'body' classes = '!text-lg text-text-highlight'>
                            {competitor.name}
                        </Text>
                        <Favorite isFavorite = {isFavorite} canEdit classes = 'w-4 h-4' parentId = {DOMId + '-name-name'}/>
                    </div>
                    <div id = {DOMId + '-name-subtitle'} className = 'w-full flex flex-row items-center'>
                        <Text id = {DOMId + '-name-subtitle-intro'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                            Plays&nbsp;{competitor.sport.name}&nbsp;in the&nbsp;
                        </Text>
                        <Map items = {competitor.competitions} callback = {(competition, index) => {
                            let prefix = index === 0 ? '' : index !== competitor.competitions.length - 1 ? ', the' : competitor.competitions.length > 1 ? ', and the' : ''
                            let suffix = (index === competitor.competitions.length - 1 ? '.' : ' ')
                            let competitionId = DOMId + '-name-subtitle-competition' + index; return (
                            <React.Fragment key = {index}>
                                <Conditional value = {prefix !== ''}>
                                    <Text id = {competitionId + '-prefix'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                                        {prefix}&nbsp;
                                    </Text>
                                </Conditional>
                                <Link to = {'/info?category=competitions&id=' + competition.id} id = {competitionId + '-link'}>
                                    <Text id = {competitionId + '-name'} preset = 'subtitle' classes = 'text-primary-main hover:text-primary-highlight'>
                                        {competition.name}
                                    </Text>
                                </Link>
                                <Conditional value = {suffix !== ''}>
                                    <Text id = {competitionId + '-suffix'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                                        {suffix}
                                    </Text>
                                </Conditional>
                            </React.Fragment>
                        )}}/>
                    </div>
                </div>
            </div>
        )
    }
    else if (category === 'competitions') {
        let competitions = item
        return (
            <div id = {DOMId} className = 'w-full h-min flex items-center gap-xs'>
                <div id = {DOMId + '-image'} className = 'transition-colors duration-main h-8 aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main'>
                    <Conditional value = {!competitions.picture}>
                        <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted'>
                            {competitions.name.substr(0, 1)}
                        </Text>
                    </Conditional>
                    <Conditional value = {competitions.picture}>
                        <Image id = {DOMId + '-image-image'} external path = {competitions.picture} classes = 'w-inscribed aspect-square'/>
                    </Conditional>
                </div>
                <div id = {DOMId + '-name'} className = 'h-full flex flex-col gap-2xs'>
                    <div id = {DOMId + '-name-name'} className = 'flex items-center gap-xs'>
                        <Text id = {DOMId + '-name-name-text'} preset = 'body' classes = '!text-lg text-text-highlight'>
                            {competitions.name}
                        </Text>
                        <Favorite isFavorite = {isFavorite} canEdit classes = 'w-4 h-4' parentId = {DOMId + '-name'}/>
                    </div>
                    <Text id = {DOMId + '-name-subtitle'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                        Plays&nbsp;{competitions.sport.name}&nbsp;in&nbsp;{competitions.country.name}.
                    </Text>
                </div>
            </div>
        )
    }
    else if (category === 'events') {
        let event = item
        if (item.is_outright) {
            return (
                <div id = {DOMId} className = 'w-full h-min flex flex-col gap-2xs'>
                    <Text id = {DOMId + '-name'} preset = 'body' classes = '!text-lg text-text-highlight'>
                        {event.name}
                    </Text>
                    <div id = {DOMId + '-subtitle'} className = 'w-full flex items-center'>
                        <Text id = {DOMId + '-subtitle-prefix'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                            {event.is_completed ? 'Played' : 'To be played'}&nbsp;in the&nbsp;
                        </Text>
                        <Link id = {DOMId + '-subtitle-competition'} to = {'/info?category=competitions&id=' + event.competition.id}>
                            <Text id = {DOMId + '-subtitle-competition-name'} preset = 'subtitle' classes = 'text-primary-main hover:text-primary-highlight'>
                                {event.competition.name}
                            </Text>
                        </Link>
                        <Text id = {DOMId + '-subtitle-date'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                            &nbsp;on&nbsp;{toDate(event.start_time)}.
                        </Text>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div id = {DOMId} className = 'w-full h-min flex items-center gap-sm'>
                    <Link id = {DOMId + '-competitor0-image'} to = {'/info?category=competitors&id=' + event.competitors[0].id} className = 'transition-colors duration-main h-8 aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main hover:border-primary-highlight'>
                        <Conditional value = {!event.competitors[0].picture}>
                            <Text id = {DOMId + '-competitor0-image-text'} preset = 'body' classes = 'text-black/muted'>
                                {event.competitors[0].name.substr(0, 1)}
                            </Text>
                        </Conditional>
                        <Conditional value = {event.competitors[0].picture}>
                            <Image id = {DOMId + '-competitor0-image-image'} external path = {event.competitors[0].picture} classes = 'w-inscribed aspect-square'/>
                        </Conditional>
                    </Link>
                    <div id = {DOMId + '-name'} className = 'w-full md:w-auto flex flex-col items-center gap-2xs'>
                        <Link id = {DOMId + '-name-competition'} to = {'/info?category=competitions&id=' + event.competition.id}>
                            <Text id = {DOMId + '-name-competition-text'} preset = 'subtitle' classes = 'text-primary-main hover:text-primary-highlight whitespace-nowrap'>
                                {event.competition.name}
                            </Text>
                        </Link>
                        <div id = {DOMId + '-name-name'} className = 'flex items-center'>
                            <Link id = {DOMId + '-competitor0-name'} to = {'/info?category=competitors&id=' + event.competitors[0].id}>
                                <Text id = {DOMId + '-competitor0-name-name'} preset = 'body' classes = '!text-lg text-primary-main hover:text-primary-highlight'>
                                    {event.competitors[0].name}
                                </Text>
                            </Link>
                            <Text id = {DOMId + '-competitors-separator'} preset = 'body' classes = '!text-lg text-text-highlight/muted'>
                                &nbsp;{event.name.includes('@') ? '@' : 'v'}&nbsp;
                            </Text>
                            <Link id = {DOMId + '-competitor1-name'} to = {'/info?category=competitors&id=' + event.competitors[1].id}>
                                <Text id = {DOMId + '-competitor1-name-name'} preset = 'body' classes = '!text-lg text-primary-main hover:text-primary-highlight'>
                                    {event.competitors[1].name}
                                </Text>
                            </Link>
                        </div>
                        <Text id = {DOMId + '-name-date'} preset = 'subtitle' classes = 'text-text-highlight/muted whitespace-nowrap'>
                            &nbsp;{toDate(event.start_time)}
                        </Text>
                        {Object.keys(event.results).length > 0 && 
                        <div id = {DOMId + '-scores'} className = 'w-full flex justify-center items-center gap-base'>
                            <Text id = {DOMId + '-competitor0-score'} preset = 'title' classes = '!font-bold !text-3xl text-text-highlight'>
                                {event.results.scores.find(score2 => score2.competitor.id === event.competitors[0].id).score}
                            </Text>
                            <Text id = {DOMId + '-scores-separator'} preset = 'title' classes = '!font-bold !text-3xl text-text-highlight/killed'>
                                -
                            </Text>
                            <Text id = {DOMId + '-competitor1-score'} preset = 'title' classes = '!font-bold !text-3xl text-text-highlight'>
                                {event.results.scores.find(score2 => score2.competitor.id === event.competitors[1].id).score}
                            </Text>
                        </div>}
                    </div>
                    <Link id = {DOMId + '-competitor1-image'} to = {'/info?category=competitors&id=' + event.competitors[1].id} className = 'transition-colors duration-main h-8 aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main hover:border-primary-highlight'>
                        <Conditional value = {!event.competitors[1].picture}>
                            <Text id = {DOMId + '-competitor1-image-text'} preset = 'body' classes = 'text-black/muted'>
                                {event.competitors[1].name.substr(0, 1)}
                            </Text>
                        </Conditional>
                        <Conditional value = {event.competitors[1].picture}>
                            <Image id = {DOMId + '-competitor1-image-image'} external path = {event.competitors[1].picture} classes = 'w-inscribed aspect-square'/>
                        </Conditional>
                    </Link>
                </div>
            )
        }
    }
    return <></>
}, (b, a) => b.category === a.category && _.isEqual(b.item, a.item))

const ErrorScreen = memo(function ErrorScreen({ category, parentId }) {
    let DOMId = parentId + '-error'
    let message = useMemo(() => {
        switch (category) {
            case 'events':
                return 'This event does not exist.'
            case 'competitors':
                return 'This competitor does not exist.'
            case 'competitions':
                return 'This competition does not exist.'
            default:
                return 'This ' + category + ' cannot be found.'
        }
    }, [category])
    
    return (
        <div id = {DOMId} className = 'w-full h-full z-20'>
            <div id = {DOMId + '-banner'} className = 'w-full h-min bg-primary-main rounded-base p-base !animate-duration-300 animate-slideInDown'>
                <Text id = {DOMId + '-message'} preset = 'body' classes = 'text-text-primary'>
                    {message}
                </Text>
            </div>
        </div>
    )
})

export default Info