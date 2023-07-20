import React, { memo, useEffect, useMemo, useState } from 'react'
import Page from '../components/page'
import { Helmet } from 'react-helmet'
import { Link, useSearchParams } from 'react-router-dom'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useWindowContext } from '../contexts/window'
import { useDatabase } from '../hooks/useDatabase'
import Conditional from '../components/conditional'
import Text from '../components/text'
import Map from '../components/map'
import now from '../lib/util/now'
import { useFavorite } from '../hooks/useFavorite'
import { Event as EventItem } from '../components/events'
import Image from '../components/image'
import { AlarmRounded, ListAltRounded } from '@mui/icons-material'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/searchBar'
import toDate from '../lib/util/toDate'
import Bets from '../components/bets'
import { Droppable } from '../components/drag'
import { forwardRef } from 'react'

const Info = memo(function Info() {
    const ALLOWED_CATEGORIES = ['competitors', 'competitions', 'events']
    const { isLandscape } = useWindowContext()
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
        <Page canScroll DOMId = {DOMId}>
            <Helmet><title>{(item ? item.name : 'Info') + ' | Betsy'}</title></Helmet>
            {item && category && ALLOWED_CATEGORIES.includes(category) && <Item category = {category} item = {item} data = {data} isLandscape = {isLandscape} parentId = {DOMId}/>}
            <Conditional value = {item === null || !ALLOWED_CATEGORIES.includes(category)}>
                <ErrorScreen category = {category} parentId = {DOMId}/>
            </Conditional>
        </Page>
    )
})

const Item = memo(function Item({ category, item, data, isLandscape, parentId }) {
    let options = useMemo(() => {return {
        competitions: {
            element: (props) => <Competition {...props}/>,
            searchConfig: {
                id: 'competition',
                filters: {
                    live: {
                        title: 'Live Events',
                        icon: (props) => <AlarmRounded {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.start_time < now() : true ).sort((a, b) => a.start_time - b.start_time)
                    },
                    has_bets: {
                        title: 'Has Bets',
                        icon: (props) => <ListAltRounded {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.bets && r.bets.length > 0 : true ).sort((a, b) => a.start_time - b.start_time)
                    }
                },
                space: { events: item.events?.length > 0 ? item.events.map(e => data.events.find(event => event.id === e.id)).sort((a, b) => a.start_time - b.start_time) : [], competitors: item.competitors },
                categories: ['events', 'competitors'],
                keys: { events: ['name', 'competitors.name'], competitors: ['name'] },
                showAllOnInitial: true
            }
        },
        competitors: {
            element: (props) => <Competitor {...props}/>,
            searchConfig: {
                id: 'competitor',
                filters: {
                    live: {
                        title: 'Live Events',
                        icon: (props) => <AlarmRounded {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.start_time < now() : true ).sort((a, b) => a.start_time - b.start_time)
                    },
                    has_bets: {
                        title: 'Has Bets',
                        icon: (props) => <ListAltRounded {...props}/>,
                        fn: (a, category) => a.filter(r => category === 'events' ? r.bets && r.bets.length > 0 : true ).sort((a, b) => a.start_time - b.start_time)
                    }
                },
                space: { events: item.events?.length > 0 ? item.events.map(e => data.events.find(event => event.id === e.id)).sort((a, b) => a.start_time - b.start_time) : [] },
                categories: ['events'],
                keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'] },
                showAllOnInitial: true
            }
        },
        events: {
            element: (props) => <Event event = {item} {...props}/>,
            searchConfig: {
                id: 'event',
                space: { bets: item.bets?.length > 0 ? item.bets : [] },
                categories: ['bets'],
                keys: { bets: ['name'] },
                showAllOnInitial: true
            }
        }
    }}, [data, item])
    let option = useMemo(() => {
        return options[category]
    }, [options, category])
    const { input, results, hasResults, filters, hasActiveFilter, setFilter, onInputChange } = useSearch(option.searchConfig)
    let Element = option.element

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
    return (
        <div id = {DOMId} className = 'w-full h-full flex flex-col pb-main'>
            <div id = {DOMId + '-bar'} className = 'sticky top-0 h-min flex flex-col-reverse md:flex-row justify-between gap-main backdrop-blur-main z-30 p-main border-b-thin border-divider-main'>
                <Title category = {category} item = {item} parentId = {DOMId}/>
                {(category === 'competitors' || category === 'competitions') && <SearchBar inputPreset = 'info' classes = 'w-full md:w-1/3' input = {input} hasResults = {hasResults} filters = {filters} hasActiveFilter = {hasActiveFilter} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} canExpand = {false} parentId = {DOMId}/>}
            </div>
            <div id = {DOMId + '-data'} className = 'w-full h-min flex flex-col md:flex-row gap-main p-main'>
                {(category === 'competitors' || category === 'competitions') &&
                <Panel title = 'Events' classes = 'w-full md:w-[28rem] min-h-0 h-full' parentId = {DOMId + '-events'}>
                    <Conditional value = {results?.events?.length > 0}>
                        <Map array = {results?.events} callback = {(event, index) => {
                            let eventId = DOMId + '-event' + index; return (
                            <React.Fragment key = {index}>
                                <EventItem item = {event} parentId = {eventId}/>
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
                </Panel>}
                <Element results = {results} isLandscape = {isLandscape} parentId = {DOMId}/>
            </div>
        </div>
    )
}, (b, a) => b.isLandscape === a.isLandscape && _.isEqual(b.item, a.item) && _.isEqual(b.data, a.data))

const Competition = memo(function Competition({ results, isLandscape, parentId }) {
    const CompetitorItem = memo(function Competitor({ item: competitor, parentId }) { 
        const [isFavorite, Favorite] = useFavorite('competitors', competitor)
        let DOMId = parentId
        return (
            <Link id = {DOMId} to = {'/info?category=competitors&id=' + competitor.id} className = 'group/item transition-transform duration-main relative w-full aspect-square flex flex-col justify-center items-center gap-small bg-base-main rounded-main border-thin border-divider-main cursor-pointer hover:scale-[1.04]'>
                <div id = {DOMId + '-image'} className = 'w-[50%] aspect-square flex justify-center items-center'>
                    <Conditional value = {competitor.picture}>
                        <Image id = {DOMId + '-image'} external path = {competitor.picture} classes = 'w-full h-full'/>
                    </Conditional>
                    <Conditional value = {!competitor.picture}>
                        <Text id = {DOMId + '-text'} preset = 'info-competitor-title'>
                            {competitor.name}
                        </Text>
                    </Conditional>
                </div>
                <Favorite isFavorite = {isFavorite} classes = 'absolute top-0 right-0 mt-small mr-small !w-4 !h-4' canEdit parentId = {DOMId}/>
            </Link>
        )
    })
    let DOMId = parentId
    return (
        <>
            <Panel title = 'Competitors' classes = 'w-full md:w-[28rem] h-min' parentId = {DOMId + '-competitors'}>
                <Conditional value = {results?.competitors?.length > 0}>
                    <div id = {DOMId + '-competitors'} className = 'w-full h-full grid grid-cols-5 gap-main p-main'>
                        <Map array = {results?.competitors} callback = {(event, index) => {
                            let competitorId = DOMId + '-competitor' + index; return (
                            <CompetitorItem key = {index} item = {event} parentId = {competitorId}/>
                        )}}/>
                    </div>
                </Conditional>
                <Conditional value = {results?.competitors?.length < 1}>
                    <div id = {DOMId + '-competitor-not-found'} className = 'w-full h-full flex p-main'>
                        <Text preset = 'info-notFound'>
                            No competitors found.
                        </Text>
                    </div>
                </Conditional>
            </Panel>
        </>
    )
}, (b, a) => b.isLandscape === a.isLandscape && _.isEqual(b.results, a.results))

const Competitor = memo(function Competitors({ results, isLandscape, parentId }) {
    let DOMId = parentId
    return (
        <>
        </>
    )
}, (b, a) => b.isLandscape === a.isLandscape && _.isEqual(b.results, a.results))

const Event = memo(function Event({ event, results, isLandscape, parentId }) {
    const History = memo(forwardRef(function History({ parentId, isOver, active }, dropRef) {
        let title = useMemo(() => {
            if (active) {
                let string = ''
                if (active.bet.key.includes('totals')) {
                    string = active.outcome.name + ' ' + active.outcome.point
                }
                else if (active.bet.key.includes('spreads')) {
                    if (active.outcome.competitor) {
                        string = active.outcome.competitor.name + ' ' + (active.outcome.point > 0 ? '+' : '') + active.outcome.point
                    }
                }
                else {
                    if (active.outcome.competitor) {
                        string = active.outcome.competitor.name + ' ' + active.bet.name
                    }
                    else {
                        string = active.outcome.name
                    }
                }
                return string
            }
            return ''
        }, [active])

        useEffect(() => {
            if (active) {
                console.log(active)
            }
        }, [active])

        let DOMId = parentId + '-history'
        return (
            <div id = {DOMId} className = {'transition-colors duration-main grow max-h-full flex flex-col justify-center items-center rounded-main border-thin border-divider-main shadow-sm md:shadow ' + (isOver ? 'bg-base-highlight' : 'bg-base-main')} ref = {dropRef}>
                {active ? (
                <Text preset = 'main-title'>
                    {title}
                </Text>
                ) : (
                <Text preset = 'info-notFound'>
                    Drag outcome here to view history
                </Text>
                )}
                
            </div>
        )
    }), (b, a) => _.isEqual(b, a))

    let DOMId = parentId
    return (
        <>
            <Panel title = 'Bets' classes = 'w-full md:w-[28rem] h-min p-main' parentId = {DOMId + '-bets'}>
                <Conditional value = {event.bets?.length > 0}>
                    <Bets event = {event} parentId = {DOMId}/>
                </Conditional>
                <Conditional value = {!event.bets || (event.bets?.length < 1)}>
                    <div id = {DOMId + '-bets-not-found'} className = 'w-full h-full flex p-main'>
                        <Text preset = 'info-notFound'>
                            No bets found.
                        </Text>
                    </div>
                </Conditional>
            </Panel>
            <Droppable id = {'event-outcome-history'}>
                <History parentId = {DOMId}/>
            </Droppable>
        </>
    )
}, (b, a) => b.isLandscape === a.isLandscape && _.isEqual(b.results, a.results))

// const MultiPanel = memo(function Panel({ classes, parentId, children }) {

// })

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

const Title = memo(function Title({ category, item, parentId }) {
    let [isFavorite, Favorite] = useFavorite(category, item)
    let title = useMemo(() => {
        let DOMId = parentId + '-title'
        if (category === 'competitors' || category === 'competitions') {
            return (
                <>
                    <Conditional value = {item.picture}>
                        <Image id = {DOMId + '-image'} external path = {item.picture} classes = 'h-5 aspect-square'/>
                    </Conditional>
                    <Text id = {DOMId + '-name'} preset = 'info-title'>
                        {item.name}
                    </Text>
                    <Favorite isFavorite = {isFavorite} canEdit classes = '!h-5' parentId = {DOMId}/>
                </>
            )
        }
        else if (category === 'events') {
            if (item.is_outright) {
                return (
                    <Text id = {DOMId + '-name'} preset = 'info-title'>
                        {item.name}
                    </Text>
                )
            }
            else {
                return (
                    <>
                        <Link id = {DOMId + '-competitor0'} to = {'/info?category=competitors&id=' + item.competitors[0].id} className = 'flex flex-row items-center gap-tiny overflow-hidden'>
                            <Conditional value = {item.competitors[0].picture}>
                                <Image id = {DOMId + '-competitor0-image'} external path = {item.competitors[0].picture} classes = 'h-5 aspect-square'/>
                            </Conditional>
                            <Text id = {DOMId + '-competitor0-name'} preset = 'info-title' classes = 'transition-colors duration-main !text-primary-main hover:!text-primary-highlight'>
                                {item.competitors[0].name}
                            </Text>
                        </Link>
                        <Text id = {DOMId + '-competitors-separator'} preset = 'info-title' classes = '!overflow-visible w-min flex'>
                            {item.name.includes('@') ? '@' : 'v'}
                        </Text>
                        <Link id = {DOMId + '-competitor1'} to = {'/info?category=competitors&id=' + item.competitors[1].id} className = 'flex flex-row items-center gap-tiny overflow-hidden'>
                            <Conditional value = {item.competitors[1].picture}>
                                <Image id = {DOMId + '-competitor1-image'} external path = {item.competitors[1].picture} classes = 'h-5 aspect-square'/>
                            </Conditional>
                            <Text id = {DOMId + '-competitor1-name'} preset = 'info-title' classes = 'transition-colors duration-main !text-primary-main hover:!text-primary-highlight'>
                                {item.competitors[1].name}
                            </Text>
                        </Link>
                    </>
                )
            }
        }
        return <></>
    }, [category, item, isFavorite])
    let subtitle = useMemo(() => {
        let DOMId = parentId + '-subtitle'
        if (category === 'competitors') {
            return (
                <>
                    <Text id = {DOMId + '-intro'} preset = 'info-subtitle'>
                        Plays&nbsp;{item.sport.name}&nbsp;in the&nbsp;
                    </Text>
                    <Map array = {item.competitions} callback = {(competition, index) => {
                        let prefix = index === 0 ? '' : index !== item.competitions.length - 1 ? ',' : item.competitions.length > 1 ? ', and' : ''
                        let suffix = (index === item.competitions.length - 1 ? '.' : ' ')
                        let competitionId = DOMId + '-competition' + index; return (
                        <React.Fragment key = {index}>
                            <Conditional value = {prefix !== ''}>
                                <Text id = {competitionId + '-prefix'} preset = 'info-subtitle'>
                                    {prefix}&nbsp;
                                </Text>
                            </Conditional>
                            <div id = {competitionId} className = 'flex flex-row items-center gap-tiny'>
                                <Conditional value = {competition.picture}>
                                    <Image id = {competitionId + '-image'} external path = {competition.picture} classes = 'h-3 aspect-square'/>
                                </Conditional>
                                <Link to = {'/info?category=competitions&id=' + competition.id} id = {competitionId + '-link'}>
                                    <Text id = {competitionId + '-name'} preset = 'info-subtitle' classes = 'transition-colors duration-main !text-primary-main hover:!text-primary-highlight'>
                                        {competition.name}
                                    </Text>
                                </Link>
                            </div>
                            <Conditional value = {suffix !== ''}>
                                <Text id = {competitionId + '-suffix'} preset = 'info-subtitle'>
                                    {suffix}
                                </Text>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </>
            )
        }
        else if (category === 'competitions'){
            return (
                <>
                    <Text id = {DOMId + '-intro'} preset = 'info-subtitle'>
                        Plays&nbsp;{item.sport.name}&nbsp;in&nbsp;
                    </Text>
                    <div id = {DOMId + '-country'} className = 'flex flex-row items-center gap-tiny'>
                        <Text id = {DOMId + '-country-name'} preset = 'info-subtitle'>
                            {item.country.name}
                        </Text>
                        <Conditional value = {item.country.picture}>
                            <Image id = {DOMId + '-country-image'} external path = {item.country.picture} classes = 'h-3 aspect-square'/>
                        </Conditional>
                    </div>
                </>
            )
        }
        else if (category === 'events') {
            return (
                <>
                    <Text id = {DOMId + '-intro'} preset = 'info-subtitle'>
                        {item.is_completed ? 'Played' : 'To be played'}&nbsp;in the&nbsp;
                    </Text>
                    <div id = {DOMId + '-competition'} className = 'flex flex-row items-center gap-tiny'>
                        <Conditional value = {item.competition.picture}>
                            <Image id = {DOMId + '-competition-image'} external path = {item.competition.picture} classes = 'h-3 aspect-square'/>
                        </Conditional>
                        <Link id = {DOMId + '-competition-link'} to = {'/info?category=competitions&id=' + item.competition.id}>
                            <Text id = {DOMId + '-competition-name'} preset = 'info-subtitle' classes = 'transition-colors duration-main !text-primary-main hover:!text-primary-highlight'>
                                {item.competition.name}
                            </Text>
                        </Link>
                    </div>
                    <Text id = {DOMId + '-intro'} preset = 'info-subtitle'>
                        &nbsp;on&nbsp;
                    </Text>
                    <Text id = {DOMId + '-intro'} preset = 'info-subtitle'>
                        {toDate(item.start_time)}.
                    </Text>
                </>
            )
        }
        return <></>
    }, [category, item])
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'w-full flex flex-col'>
            <div id = {DOMId + '-title'} className = 'w-full flex flex-row items-center gap-tiny'>
                {title}
            </div>
            <div id = {DOMId + '-subtitle'} className = 'w-full flex flex-row flex-wrap items-center'>
                {subtitle}
            </div>
        </div>
    )
}, (b, a) => b.category === a.category && _.isEqual(b.item, a.item))

const ErrorScreen = memo(function ErrorScreen({ category, parentId }) {
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
    let DOMId = parentId + '-error'
    return (
        <div id = {DOMId} className = 'w-full h-full z-20 p-main'>
            <div id = {DOMId + '-banner'} className = 'w-full h-min bg-primary-main rounded-main p-main !animate-duration-300 animate-slideInDown'>
                <Text id = {DOMId + '-message'} preset = 'info-error'>
                    {message}
                </Text>
            </div>
        </div>
    )
})

export default Info