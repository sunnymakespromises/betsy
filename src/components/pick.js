import React, { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { useOdds } from '../hooks/useOdds'
import Conditional from './conditional'
import Text from './text'
import Map from './map'
import SelectSlips from './selectSlips'
import { compressPick } from '../lib/util/manipulateBets'

const Pick = memo(function Pick({ expandedPick, events, isEditable, isDetailed, onRemove, classes, parentId }) {
    let [isExpanded, setIsExpanded] = useState(false)
    let [isSelecting, setIsSelecting] = useState(false)
    const clickRef = useCancelDetector(() => setIsExpanded(false))

    let DOMId = parentId
    let name = useMemo(() => {
        let string = ''
        if (expandedPick.bet.key.includes('totals')) {
            string = expandedPick.outcome.name + ' ' + expandedPick.outcome.point
        }
        else if (expandedPick.bet.key.includes('spreads')) {
            if (expandedPick.outcome.competitor) {
                string = expandedPick.outcome.competitor.name + ' ' + (expandedPick.outcome.point > 0 ? '+' : '') + expandedPick.outcome.point
            }
        }
        else {
            if (expandedPick.outcome.competitor) {
                string = expandedPick.outcome.competitor.name
            }
            else {
                string = expandedPick.outcome.name
            }
        }
        
        if (isDetailed && expandedPick.outcome.competitor) {
            return (
                <Text id = {DOMId + '-name'} preset = 'body' classes = {'w-full text-center whitespace-nowrap overflow-hidden text-ellipsis hover:text-primary-main cursor-pointer ' + (expandedPick.did_hit !== null ? (expandedPick.did_hit === true ? 'text-positive-main' : expandedPick.did_hit === false ? 'text-negative-main' : 'text-text-main/killed') : 'text-primary-main')}>
                    {string}
                </Text>
            )
        }
        return (
            <Text id = {DOMId + '-name'} preset = 'body' classes = {'w-full text-center whitespace-nowrap overflow-hidden text-ellipsis ' + (expandedPick.did_hit !== null ? (expandedPick.did_hit === true ? 'text-positive-main' : expandedPick.did_hit === false ? 'text-negative-main' : 'text-text-main/killed') : 'text-primary-main')}>
                {string}
            </Text>
        )
    }, [expandedPick])

    let eventName = useMemo(() => {
        if (expandedPick.bet && expandedPick.outcome && expandedPick.event && isDetailed) {
            return (
                <Link id = {DOMId + '-event-link'} to = {'/info?category=events&id=' + expandedPick.event.id} className = 'max-w-full group/link' onClick = {(e) => { e.stopPropagation()}}>
                    <Conditional value = {expandedPick.event.is_outright}>
                        <Text id = {DOMId + '-event-name'} preset = 'subtitle' classes = {'w-full text-center whitespace-nowrap text-text-main/killed group-hover/link:text-primary-main'}>
                            {expandedPick.event.name}
                        </Text>
                    </Conditional>
                    <Conditional value = {!expandedPick.event.is_outright}>
                    <div id = {DOMId + '-event'} className = 'group/info w-full flex justify-center items-center'>
                        <Text id = {DOMId + '-event-competitor0-name'} preset = 'subtitle' classes = {'max-w-full text-center whitespace-nowrap overflow-hidden text-ellipsis text-text-main/killed group-hover/link:text-primary-main'}>
                            {expandedPick.event.competitors[0].name}
                        </Text>
                        <Text id = {DOMId + '-event-competitors-separator'} preset = 'subtitle' classes = {'text-center w-min flex text-text-main/killed group-hover/link:text-primary-main'}>
                            &nbsp;{expandedPick.event.name.includes('@') ? '@' : 'v'}&nbsp;
                        </Text>
                        <Text id = {DOMId + '-event-competitor1-name'} preset = 'subtitle' classes = {'max-w-full text-center whitespace-nowrap overflow-hidden text-ellipsis text-text-main/killed group-hover/link:text-primary-main'}>
                            {expandedPick.event.competitors[1].name}
                        </Text>
                    </div>
                    </Conditional>
                </Link>
            )
        }
        return <></>
    })

    const options = [
        {
            title: 'Add to Slips',
            condition: true,
            onClick: () => {
                setIsSelecting(true)
                setIsExpanded(false)
            }
        },
        {
            title: 'Remove From Slip',
            condition: isEditable,
            onClick: () => {
                onRemove(compressPick(expandedPick))
                setIsExpanded(false)
            }
        }
    ]

    return (
        <>
            <div id = {DOMId} className = {'group/pick relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-xs p-sm rounded-base bg-base-main/muted' + (expandedPick.did_hit === null ? ' hover:bg-base-main cursor-pointer' : '') + (classes ? ' ' + classes : '')} onClick = {() => expandedPick.did_hit === null ? setIsExpanded(true) : null} ref = {clickRef}>
                {eventName}
                <Text id = {DOMId + '-bet-name'} preset = 'subtitle' classes = {'text-text-main/killed'}>
                    {expandedPick.bet.name}
                </Text>
                {name}
                <Value value = {expandedPick.outcome.odds} didHit = {expandedPick.did_hit} parentId = {DOMId}/>
                <Conditional value = {isExpanded}>
                    <div id = {DOMId + '-modal'} className = 'absolute top-0 left-0 w-full h-full flex flex-col bg-primary-main rounded-base z-10 overflow-hidden'>
                        <Map items = {options} callback = {(option, index) => {
                            let optionId = DOMId + '-option' + index; 
                            return option.condition && (
                                <React.Fragment key = {index}>
                                    <Option title = {option.title} onClick = {option.onClick} parentId = {optionId}/>
                                    <Conditional value = {index !== options.length - 1}>
                                        <div className = 'transition-colors duration-main border-t-sm border-divider-primary'/>
                                    </Conditional>
                                </React.Fragment>
                            )
                        }}/>
                    </div>
                </Conditional>
            </div>
            <Conditional value = {isSelecting}>
                <SelectSlips expandedPicksToAdd = {[expandedPick]} events = {events} setIsSelecting = {setIsSelecting} parentId = {DOMId}/>
            </Conditional>
        </>

    )
}, (b, a) => b.isEditable === a.isEditable && b.isDetailed === a.isDetailed && b.classes === a.classes && _.isEqual(b.expandedPick, a.expandedPick) && _.isEqual(b.events, a.events))

const Option = memo(function Option({ title, onClick, parentId }) {
    let DOMId = parentId
    return (
        <Text id = {DOMId} preset = 'body' classes = 'grow flex items-center justify-center hover:bg-primary-highlight p-xs text-text-primary cursor-pointer' onClick = {() => onClick()}>
            {title}
        </Text>
    )
}, (b, a) => b.title === a.title)

const Value = memo(function Value({ value, didHit, parentId }) {
    const { getOdds } = useOdds()
    let odds = useMemo(() => getOdds(value), [value])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = 'title' classes = {'!font-bold ' + (didHit !== null ? (didHit === true ? 'text-positive-main' : didHit === false ? 'text-negative-main' : 'text-text-main/killed') : 'text-primary-main')}>
            {odds}
        </Text>
    )
}, (b, a) => b.value === a.value && b.didHit === a.didHit)

export default Pick