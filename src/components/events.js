import React, { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlarmRounded, CircleRounded, ListAltRounded } from '@mui/icons-material'
import _ from 'lodash'
import { useSearch } from '../hooks/useSearch'
import Text from './text'
import Conditional from './conditional'
import Bets from './bets'
import SearchBar from './searchBar'
import now from '../lib/util/now'
import toDate from '../lib/util/toDate'
import Image from './image'
import Map from './map'

const Events = memo(function Events({ search = true, searchKey, events, parentId }) {
    const searchConfig = {
        id: searchKey,
        filters: {
            live: {
                title: 'Live Events',
                icon: (props) => <AlarmRounded {...props}/>,
                fn: (a) => a.filter(r => r.start_time < now()).sort((a, b) => a.start_time - b.start_time),
                turnsOff: ['popular', 'alphabetical']
            },
            has_bets: {
                title: 'Has Bets',
                icon: (props) => <ListAltRounded {...props}/>,
                fn: (a) => a.filter(r => r.bets && r.bets.length > 0).sort((a, b) => a.start_time - b.start_time)
            }
        },
        space: events,
        keys: ['name', 'competition.name', 'competitors.name', 'sport.name'],
        shape: 'array',
        showAllOnInitial: true
    }
    const { input, results, hasResults, filters, hasActiveFilter, setFilter, onInputChange } = useSearch(searchConfig)

    let DOMId = parentId + '-events'
    if (events) {
        return (
            <div id = {DOMId} className = 'h-full flex flex-col'>
                <Conditional value = {search}>
                    <SearchBar inputPreset = 'events' input = {input} hasResults = {hasResults} filters = {filters} hasActiveFilter = {hasActiveFilter} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {false} autoFocus = {false} canExpand = {false} parentId = {DOMId}/>
                    <div className = 'border-t-thin border-divider-main'/>
                </Conditional>
                <Map array = {results} callback = {(event, index) => {
                    let eventId = DOMId + '-event' + index; return (
                    <React.Fragment key = {index}>
                        <Event item = {event} parentId = {eventId}/>
                        <Conditional value = {index !== results.length - 1}>
                            <div className = 'border-t-thin border-divider-main'/>
                        </Conditional>
                    </React.Fragment>
                )}}/>
            </div>
        )
    }
}, (b, a) => b.search === a.search && b.searchKey === a.searchKey && _.isEqual(b.events, a.events))


export const Event = memo(function Event({ item: event, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'group/event relative w-full h-min flex flex-col gap-small p-main'}>
            <div id = {DOMId + '-info'} className = 'w-full flex flex-col'>
                <Subtitle event = {event} parentId = {DOMId}/>
                <Name event = {event} parentId = {DOMId}/>
            </div>
            <Bets event = {event} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => _.isEqual(b.item, a.item))

const Subtitle = memo(function Subtitle({ event, parentId }) {
    let DOMId = parentId + '-subtitle'
    return (
        <div id = {DOMId} className = 'flex flex-row items-center'>
            <Link to = {'/info?category=competitions&id=' + event.competition.id} id = {DOMId + '-competition'} className = 'flex flex-row items-center gap-micro'>
                <Conditional value = {event.competition.picture}>
                    <Image id = {DOMId + '-competition-image'} external path = {event.competition.picture} classes = 'h-3 aspect-square'/>
                </Conditional>
                <Text id = {DOMId + '-competition-name'} preset = 'events-subtitle' classes = 'transition-colors duration-main !text-primary-main hover:!text-primary-highlight'>
                    {event.competition.name}
                </Text>
            </Link>
            <Text id = {DOMId + '-date'} preset = 'events-subtitle'>
                &nbsp;{'• ' + toDate(event.start_time)}
            </Text>
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event))

const Name = memo(function Name({ event, parentId }) {
    const isLive = useMemo(() => event.start_time < now(), [event])
    let DOMId = parentId
    let name = useMemo(() => {
        if (event.is_outright) {
            return (
                <Link to = {'/info?category=events&id=' + event.id} className = 'group/name flex flex-row items-center'>
                    <Text id = {DOMId + '-name'} preset = 'events-name'>
                        {event.name}
                    </Text>
                </Link>
            )
        }
        else {
            return (
                <Link to = {'/info?category=events&id=' + event.id} className = 'group/name flex flex-row items-center'>
                    <div id = {DOMId + '-competitor0'}  className = 'flex flex-row items-center gap-tiny overflow-hidden'>
                        <Conditional value = {event.competitors[0].picture}>
                            <Image id = {DOMId + '-competitor0-image'} external path = {event.competitors[0].picture} classes = 'h-4 aspect-square'/>
                        </Conditional>
                        <Text id = {DOMId + '-competitor0-name'} preset = 'events-name'>
                            {event.competitors[0].name}
                        </Text>
                    </div>
                    <Text id = {DOMId + '-competitors-separator'} preset = 'events-name' classes = '!overflow-visible w-min flex'>
                        &nbsp;{event.name.includes('@') ? '@' : 'v'}&nbsp;
                    </Text>
                    <div id = {DOMId + '-competitor1'} className = 'flex flex-row items-center gap-tiny overflow-hidden'>
                        <Conditional value = {event.competitors[1].picture}>
                            <Image id = {DOMId + '-competitor1-image'} external path = {event.competitors[1].picture} classes = 'h-4 aspect-square'/>
                        </Conditional>
                        <Text id = {DOMId + '-competitor1-name'} preset = 'events-name'>
                            {event.competitors[1].name}
                        </Text>
                    </div>
                </Link>
            )
        }
    },[event])

    return (
        <div id = {DOMId + '-title'} className = 'w-min max-w-full flex flex-row items-center gap-tiny overflow-hidden'>
            <Conditional value = {isLive}>
                <CircleRounded id = {DOMId + '-live-icon'} className = '!h-3 !w-3 text-live-main'/>
            </Conditional>
            {name}
        </div>
    )
}, (b, a) => _.isEqual(b.event, a.event))

export default Events