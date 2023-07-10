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

    let DOMId = 'info-'
    return (
        <Page>
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
    let DOMId = parentId + 'event-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col gap-main'>
            <div id = {DOMId + 'group-1-container'} className = 'grow flex flex-row justify-between items-center'>
                <Title name = {event.name} category = 'events' item = {event} parentId = {DOMId}/>
                {/* <SearchBar inputPreset = 'info' classes = 'w-1/3' input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {true} canExpand = {false} parentId = {DOMId}/> */}
            </div>
            <div id = {DOMId + 'group-2-container'} className = 'w-full md:w-[28rem] min-h-0 h-full flex flex-row gap-main'>
                <Panel title = 'Odds' classes = 'h-full w-full' parentId = {DOMId + 'events-'}>
                    <div className = 'w-full h-full flex p-main'>
                        <Odds event = {event} parentId = {DOMId}/>
                    </div>
                </Panel>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event))

const Competition = memo(function Competition({ competition, data, parentId }) {
    let events = useMemo(() => competition.events.length > 0 && competition.events.map(e => data.events.find(event => event.id === e.id)).sort((a, b) => a.start_time - b.start_time), [data, competition])
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

    let DOMId = parentId + 'competition-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col gap-main'>
            <div id = {DOMId + 'group-1-container'} className = 'grow flex flex-row justify-between'>
                <Title name = {competition.name} category = 'competitions' item = {competition} parentId = {DOMId}/>
                <SearchBar inputPreset = 'info' classes = 'w-1/3' input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {true} canExpand = {false} parentId = {DOMId}/>
            </div>
            <div id = {DOMId + 'data-container'} className = 'w-full md:w-[28rem] min-h-0 h-full flex flex-row gap-main'>
                <Panel title = 'Events' classes = 'h-full w-full' parentId = {DOMId + 'events-'}>
                    <List items = {results?.events} element = {EventItem} dividers parentId = {parentId}/>
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

    let DOMId = parentId
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col gap-main'>
            <div id = {DOMId + 'group-1-container'} className = 'grow flex flex-row justify-between'>
                <Title name = {competitor.name} category = 'competitors' item = {competitor} parentId = {DOMId}/>
                <SearchBar inputPreset = 'info' classes = 'w-1/3' input = {input} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {true} canExpand = {false} parentId = {DOMId}/>
            </div>
            <div id = {DOMId + 'data-container'} className = 'w-full md:w-[28rem] min-h-0 h-full flex flex-row gap-main'>
                <Panel title = 'Events' classes = 'h-full w-full' parentId = {DOMId + 'events-'}>
                    <List items = {results?.events} element = {EventItem} dividers parentId = {parentId}/>
                </Panel>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.data, a.data) && _.isEqual(b.competitor, a.competitor))

const Panel = memo(function Panel({ title, classes, parentId, children }) {
    let DOMId = parentId + 'panel-'
    return (
        <div id = {DOMId + 'container'} className = {'min-h-0 flex flex-col rounded-main border-thin border-divider-main md:shadow' + (classes ? ' ' + classes : '')}>
            <div id = {DOMId + 'title-container'} className = 'w-full h-min flex flex-row items-center p-main'>
                <Text id = {DOMId + 'title'} preset = 'info-panel'>
                    {title}
                </Text>
            </div>
            <div className = 'divider border-t-thin border-divider-main'/>
            <div id = {DOMId + 'child-container'} className = 'min-h-0 w-full'>
                {children}
            </div>
        </div>
    )
})

const Title = memo(function Title({ name, category, item, parentId }) {
    let { isFavorite, Favorite } = useFavorite(category, item)
    let title = useMemo(() => {
        if (category === 'competitors' || category === 'competitions') {
            return (
                <>
                    <div id = {parentId + 'competitor-container'} className = 'flex flex-row items-center gap-tiny'>
                        <Conditional value = {item.picture}>
                            <Image id = {parentId + 'image'} external path = {item.picture} classes = 'h-5 aspect-square'/>
                        </Conditional>
                        <Text preset = 'info-item-title'>
                            {name}
                        </Text>
                    </div>
                    <Favorite isFavorite = {isFavorite} canEdit classes = '!h-5' parentId = {parentId}/>
                </>
            )
        }
        else if (category === 'events') {
            const isLive = item.start_time < now()
            if (item.is_outright) {
                return <Text id = {parentId + 'name'} preset = 'info-item-title'>{name}</Text>
            }
            else {
                if (item.competitors) {
                    return (
                    <>
                        <Conditional value = {isLive}>
                            <CircleRounded id = {parentId + 'live-icon'} className = '!h-3 !w-3 text-live-main'/>
                        </Conditional>
                        <div id = {parentId + 'competitor-1-container'} className = 'flex flex-row items-center gap-tiny'>
                            <Conditional value = {item.competitors[0].picture}>
                                <Image id = {parentId + 'image'} external path = {item.competitors[0].picture} classes = 'h-5 aspect-square'/>
                            </Conditional>
                            <Link to = {'/info?category=competitors&id=' + item.competitors[0].id}>
                                <Text id = {parentId + 'competitor-1-name'} preset = 'info-item-title' classes = '!text-primary-main'>
                                    {item.competitors[0].name}
                                </Text>
                            </Link>
                        </div>
                        <Text preset = 'info-item-title'>
                            {name.includes('@') ? '@' : 'v'}
                        </Text>
                        <div id = {parentId + 'competitor-2-container'} className = 'flex flex-row items-center gap-tiny'>
                            <Conditional value = {item.competitors[1].picture}>
                                <Image id = {parentId + 'image'} external path = {item.competitors[1].picture} classes = 'h-5 aspect-square'/>
                            </Conditional>
                            <Link to = {'/info?category=competitors&id=' + item.competitors[1].id}>
                                <Text id = {parentId + 'competitor-2-name'} preset = 'info-item-title' classes = '!text-primary-main'>
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
        if (category === 'competitors') {
            return (
                <>
                    <Text id = {parentId + 'plays-in'} preset = 'info-item-subtitle'>
                        Plays&nbsp;{item.sport.name}&nbsp;in the&nbsp;
                    </Text>
                    <Map array = {item.competitions} callback = {(competition, index) => {
                        let prefix = index === 0 ? '' : index !== item.competitions.length - 1 ? ',' : item.competitions.length > 1 ? ', and' : ''
                        let suffix = (index === item.competitions.length - 1 ? '.' : ' ')
                        let subtitleId = parentId + 'subtitle-' + index + '-'; return (
                        <React.Fragment key = {index}>
                            <Conditional value = {prefix !== ''}>
                                <Text id = {subtitleId + 'name-prefix'} preset = 'info-item-subtitle'>
                                    {prefix}&nbsp;
                                </Text>
                            </Conditional>
                            <div id = {parentId + 'competition-container'} className = 'flex flex-row items-center gap-tiny'>
                                <Conditional value = {competition.picture}>
                                    <Image id = {parentId + 'image'} external path = {competition.picture} classes = 'h-3 aspect-square'/>
                                </Conditional>
                                <Link to = {'/info?category=competitions&id=' + competition.id} id = {subtitleId + 'container'}>
                                    <Text id = {subtitleId + 'name'} preset = 'info-item-subtitle' classes = '!text-primary-main'>
                                        {competition.name}
                                    </Text>
                                </Link>
                            </div>
                            <Conditional value = {suffix !== ''}>
                                <Text id = {subtitleId + 'name-suffix'} preset = 'info-item-subtitle'>
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
                    <Text id = {parentId + 'subtitle-intro'} preset = 'info-item-subtitle'>
                        {isLive ? 'Being' : 'To be'}&nbsp;played in the&nbsp;
                    </Text>
                    <div id = {parentId + 'competition-container'} className = 'flex flex-row items-center gap-tiny'>
                        <Conditional value = {item.competition.picture}>
                            <Image id = {parentId + 'image'} external path = {item.competition.picture} classes = 'h-3 aspect-square'/>
                        </Conditional>
                        <Link to = {'/info?category=competitions&id=' + item.competition.id} id = {parentId + 'competition-link'}>
                            <Text id = {parentId + 'subtitle-name'} preset = 'info-item-subtitle' classes = '!text-primary-main'>
                                {item.competition.name}
                            </Text>
                        </Link>
                    </div>
                    <Text id = {parentId + 'subtitle-time'} preset = 'info-item-subtitle'>
                        &nbsp;{'at ' + toDate(item.start_time) + '.'}
                    </Text>
                </>
            )
        }
        else {
            return (
                <>
                    <Text id = {parentId + 'plays-in'} preset = 'info-item-subtitle'>
                        Hosts&nbsp;{item.sport.name}&nbsp;in&nbsp;
                    </Text>
                    <div id = {parentId + 'country-container'} className = 'flex flex-row items-center gap-tiny'>
                        <Text id = {parentId + 'subtitle-name'} preset = 'info-item-subtitle'>
                            {item.country.name}
                        </Text>
                        <Conditional value = {item.country.picture}>
                            <Image id = {parentId + 'image'} external path = {item.country.picture} classes = 'h-3 aspect-square'/>
                        </Conditional>
                    </div>
                </>
            )
        }
    }, [name, category, item])
    return (
        <div id = {parentId + 'text-container'} className = 'w-min flex flex-col'>
            <div id = {parentId + 'name-container'} className = 'w-min flex flex-row items-center gap-tiny'>
                {title}
            </div>
            <div id = {parentId + 'subtitle-container'} className = 'w-min flex flex-row items-center'>
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
    let DOMId = parentId + 'error-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full backdrop-blur-main z-20'>
            <div id = {DOMId + 'banner'} className = 'w-full h-min bg-primary-main rounded-main p-main !animate-duration-300 animate-slideInDown'>
                <Text id = {DOMId + 'message'} preset = 'info-error'>
                    {message}
                </Text>
            </div>
        </div>
    )
})

export default Info