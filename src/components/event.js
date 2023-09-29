import React, { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import Text from './text'
import Conditional from './conditional'
import Bets from './bets'
import now from '../lib/util/now'
import toDate from '../lib/util/toDate'
import Image from './image'

const Event = memo(function Event({ item: event, bets, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'group/event relative transition-colors duration-main w-full flex flex-col items-center gap-sm'}>
            <Title event = {event} parentId = {DOMId}/>
            <Bets event = {event} bets = {bets} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => _.isEqual(b.bets, a.bets) &&  _.isEqual(b.item, a.item))

const Title = memo(function Title({ event, parentId }) {
    const isLive = useMemo(() => event.start_time < now(), [event])
    let DOMId = parentId + '-title'
    if (event.is_outright) {
        return (
            <div id = {DOMId} className = 'flex flex-col items-center gap-2xs'>
                <Conditional value = {isLive}>
                    <div id = {DOMId + '-live'} className = 'absolute top-0 left-0 bg-accent-main rounded-base p-xs shadow-lg'>
                        <Text id = {DOMId + '-live-text'} preset = 'subtitle' classes = 'text-text-accent'>
                            LIVE
                        </Text>
                    </div>
                </Conditional>
                <Link id = {DOMId + '-competition'} to = {'/info?category=competitions&id=' + event.competition.id}>
                    <Text id = {DOMId + '-competition-text'} preset = 'subtitle' classes = 'text-primary-main hover:text-primary-highlight whitespace-nowrap'>
                        {event.competition.name}
                    </Text>
                </Link>
                <Link id = {DOMId + '-name'} to = {'/info?category=events&id=' + event.id}>
                    <Text id = {DOMId + '-name-text'} preset = 'body' classes = '!text-lg text-primary-main hover:text-primary-highlight whitespace-nowrap'>
                        {event.name}
                    </Text>
                </Link>
                <Text id = {DOMId + '-info-date'} preset = 'subtitle' classes = 'text-text-highlight/muted whitespace-nowrap'>
                    &nbsp;{toDate(event.start_time)}
                </Text>
            </div>
        )
    }
    else {
        return (
            <div id = {DOMId} className = 'w-min flex justify-center items-center gap-sm'>
                <Conditional value = {isLive}>
                    <div id = {DOMId + '-live'} className = 'absolute top-0 left-0 bg-accent-main rounded-base p-xs shadow-lg'>
                        <Text id = {DOMId + '-live-text'} preset = 'subtitle' classes = 'text-text-accent'>
                            LIVE
                        </Text>
                    </div>
                </Conditional>
                <Link id = {DOMId + '-competitor0-image'} to = {'/info?category=competitors&id=' + event.competitors[0].id} className = 'transition-colors duration-main h-8 md:h-8 aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main hover:border-primary-highlight'>
                    <Conditional value = {!event.competitors[0].picture}>
                        <Text id = {DOMId + '-competitor0-image-text'} preset = 'body' classes = 'text-black/muted'>
                            {event.competitors[0].name.substr(0, 1)}
                        </Text>
                    </Conditional>
                    <Conditional value = {event.competitors[0].picture}>
                        <Image id = {DOMId + '-competitor0-image-image'} external path = {event.competitors[0].picture} classes = 'w-inscribed aspect-square'/>
                    </Conditional>
                </Link>
                <div id = {DOMId + '-info'} className = 'grow flex flex-col items-center gap-2xs overflow-hidden'>
                    <Link id = {DOMId + '-info-competition'} to = {'/info?category=competitions&id=' + event.competition.id}>
                        <Text id = {DOMId + '-info-competition-text'} preset = 'subtitle' classes = 'text-primary-main hover:text-primary-highlight whitespace-nowrap'>
                            {event.competition.name}
                        </Text>
                    </Link>
                    <Link id = {DOMId + '-info-name'} to = {'/info?category=events&id=' + event.id} className = 'group/info w-full flex justify-center items-center'>
                        <Text id = {DOMId + '-info-competitor0-name'} preset = 'body' classes = '!text-lg text-primary-main group-hover/info:text-primary-highlight whitespace-nowrap overflow-hidden text-ellipsis'>
                            {event.competitors[0].name}
                        </Text>
                        <Text id = {DOMId + '-info-competitors-separator'} preset = 'body' classes = '!text-lg text-primary-main group-hover/info:text-primary-highlight w-min flex'>
                            &nbsp;{event.name.includes('@') ? '@' : 'v'}&nbsp;
                        </Text>
                        <Text id = {DOMId + '-info-competitor1-name-name'} preset = 'body' classes = '!text-lg text-primary-main group-hover/info:text-primary-highlight whitespace-nowrap overflow-hidden text-ellipsis'>
                            {event.competitors[1].name}
                        </Text>
                    </Link>
                    <Text id = {DOMId + '-info-date-text'} preset = 'subtitle' classes = 'text-text-highlight/killed whitespace-nowrap'>
                        {toDate(event.start_time)}
                    </Text>
                </div>
                <Link id = {DOMId + '-competitor1-image'} to = {'/info?category=competitors&id=' + event.competitors[1].id} className = 'transition-colors duration-main h-8 md:h-8 aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main hover:border-primary-highlight'>
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
}, (b, a) => _.isEqual(b.event, a.event))

export default Event