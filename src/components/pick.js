import React, { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { useSearchEventsContext } from '../contexts/searchEvents'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { useOdds } from '../hooks/useOdds'
import Conditional from './conditional'
import Text from './text'
import Map from './map'
import SelectSlips from './selectSlips'
import { compressPick } from '../lib/util/manipulateBets'
import SearchEvents from './searchEvents'
import { CheckCircleFill, Circle, Plus } from 'react-bootstrap-icons'

const Pick = memo(function Pick({ expandedPick, events, isEditable, isDetailed, onRemove, classes, parentId }) {
    let DOMId = parentId
    let compressedPick = compressPick(expandedPick)
    let searchEventsContext = useSearchEventsContext()
    let isNewPick = searchEventsContext !== undefined
    let [isExpanded, setIsExpanded] = useState(false)
    let [isSelecting, setIsSelecting] = useState(false)
    const cancelRef = useCancelDetector(() => setIsExpanded(false))

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
        
        return (
            <Text id = {DOMId + '-name'} preset = 'body' classes = {'w-full text-center whitespace-nowrap overflow-hidden text-ellipsis ' + (expandedPick.did_hit !== null ? (expandedPick.did_hit === true ? 'text-positive-main' : expandedPick.did_hit === false ? 'text-negative-main' : 'text-text-main/killed') : 'text-primary-main')}>
                {string}
            </Text>
        )
    }, [expandedPick])

    let eventName = useMemo(() => {
        if (expandedPick.bet && expandedPick.outcome && expandedPick.event && isDetailed) {
            return (
                <Link id = {DOMId + '-event-link'} to = {'/info?category=events&id=' + expandedPick.event.id} className = 'max-w-full group/link' onClick = {(e) => { e.stopPropagation() }}>
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

    const options = useMemo(() => { return [
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
    ]}, [isEditable, expandedPick])

    return (
        <>
            <div id = {DOMId} className = {'group/pick relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-xs p-sm rounded-base border-sm shadow-sm overflow-hidden ' + (isExpanded ? 'border-primary-main' : 'border-divider-highlight') + (expandedPick.did_hit === null && (isNewPick ? searchEventsContext.canAddPickToSlip(compressedPick) : true) ? ' hover:bg-base-main/killed cursor-pointer' : '') + (classes ? ' ' + classes : '')} onClick = {() => expandedPick.did_hit === null && !isNewPick ? setIsExpanded(true) : isNewPick && searchEventsContext.canAddPickToSlip(compressedPick) ? searchEventsContext.onSelectPick(compressedPick) : null} ref = {cancelRef}>
                {eventName}
                <Text id = {DOMId + '-bet-name'} preset = 'subtitle' classes = 'text-text-main/killed'>
                    {expandedPick.bet.name}
                </Text>
                {name}
                <Value value = {expandedPick.outcome.odds} didHit = {expandedPick.did_hit} parentId = {DOMId}/>
                <Conditional value = {!isNewPick}>
                    <div id = {DOMId + '-modal'} className = {'transition-all duration-main absolute top-0 left-0 w-full h-full flex flex-col bg-primary-main z-10 overflow-hidden ' + (isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none' )}>
                        <Map items = {options} callback = {(option, index) => {
                            let optionId = DOMId + '-option' + index; 
                            return option.condition && (
                                <React.Fragment key = {index}>
                                    <Option title = {option.title} onClick = {option.onClick} parentId = {optionId}/>
                                    <Conditional value = {index !== options.filter(option => option.condition).length - 1}>
                                        <div className = 'transition-colors duration-main border-t-sm border-divider-primary'/>
                                    </Conditional>
                                </React.Fragment>
                            )
                        }}/>
                    </div>
                </Conditional>
                {isNewPick &&
                <div id = {DOMId + '-select'} className = 'absolute top-sm right-sm'>
                    <Conditional value = {!searchEventsContext?.selectedPicks?.includes(compressedPick)}>
                        <Circle id = {DOMId + '-select-not-selected'} className = {'text-lg ' + (searchEventsContext?.canAddPickToSlip(compressedPick) ? 'text-primary-main' : 'text-text-highlight/killed')}/>
                    </Conditional>
                    <Conditional value = {searchEventsContext?.selectedPicks?.includes(compressedPick)}>
                        <CheckCircleFill id = {DOMId + '-select-selected'} className = 'text-lg text-primary-main'/>
                    </Conditional>
                </div>}
            </div>
            <Conditional value = {isSelecting && !isNewPick}>
                <SelectSlips expandedPicksToAdd = {[expandedPick]} events = {events} setIsSelecting = {setIsSelecting} parentId = {DOMId}/>
            </Conditional>
        </>

    )
}, (b, a) => b.isEditable === a.isEditable && b.isDetailed === a.isDetailed && b.classes === a.classes && _.isEqual(b.expandedPick, a.expandedPick) && _.isEqual(b.events, a.events))

export const NewPick = memo(function NewPick({ compressedSlip, parentId }) {
    let DOMId = parentId + '-new-pick'
    let [isSearching, setIsSearching] = useState(false)

    return (
        <>
            <div id = {DOMId} className = {'group/new-pick relative transition-colors duration-main w-full flex flex-col justify-center items-center gap-xs p-sm rounded-base border-sm shadow-sm overflow-hidden hover:bg-base-main/killed cursor-pointer ' + (isSearching ? 'border-primary-main' : 'border-divider-highlight')} onClick = {() => setIsSearching(true)}>
                <Plus id = {DOMId + '-icon'} className = {'transition-colors duration-main text-3xl ' + (isSearching ? 'text-primary-main' : 'text-text-highlight/killed group-hover/new-pick:text-primary-main')} />
            </div>
            <Conditional value = {isSearching}>
                <SearchEvents compressedSlip = {compressedSlip} setIsSearching = {setIsSearching} parentId = {DOMId}/>
            </Conditional>
        </>

    )
}, (b, a) => b.compressedSlip === a.compressedSlip)

function Option({ title, onClick, parentId }) {
    let DOMId = parentId

    return (
        <Text id = {DOMId} preset = 'body' classes = 'grow flex items-center justify-center hover:bg-primary-highlight p-xs text-text-primary cursor-pointer' onClick = {() => onClick()}>
            {title}
        </Text>
    )
}

const Value = memo(function Value({ value, didHit, parentId }) {
    let DOMId = parentId + '-value'
    const { getOdds } = useOdds()
    let odds = useMemo(() => getOdds(value), [value])
    
    return (
        <Text id = {DOMId} preset = 'title' classes = {'!font-bold ' + (didHit !== null ? (didHit === true ? 'text-positive-main' : didHit === false ? 'text-negative-main' : 'text-text-main/killed') : 'text-primary-main')}>
            {odds}
        </Text>
    )
}, (b, a) => b.value === a.value && b.didHit === a.didHit)

export default Pick