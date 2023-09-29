import React, { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Text from './text'
import { useOdds } from '../hooks/useOdds'
import Conditional from './conditional'
import { Check, Circle, Plus, PlusCircleFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { createPortal } from 'react-dom'
import Map from './map'
import { useStore } from '../hooks/useStore'
import toDate from '../lib/util/toDate'
import expandPick, { compressPick } from '../lib/util/expandPick'
import now from '../lib/util/now'
import { default as short } from 'short-uuid'
import { useDataContext } from '../contexts/data'

const Pick = memo(function Pick({ expandedPick, isEditable, isDetailed, onRemove, classes, parentId }) {
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
                onRemove(expandedPick)
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
                <Select expandedPicks = {[expandedPick]} setIsSelecting = {setIsSelecting} parentId = {DOMId}/>
            </Conditional>
        </>

    )
}, (b, a) => b.isEditable === a.isEditable && b.isDetailed === a.isDetailed && b.classes === a.classes && _.isEqual(b.expandedPick, a.expandedPick))

export const Select = memo(function Select({ expandedPicks, setIsSelecting, parentId }) {
    let { data } = useDataContext()
    let [slips, addSlip, , editSlip, ] = useStore('user_slips', 'array')
    let [containerElement, setContainerElement] = useState()
    useLayoutEffect(() => {
        if (!containerElement && document.getElementById('body')) {
             setContainerElement(document.getElementById('body'))
        }
    }, [])
    let cancelRef = useCancelDetector(() => setIsSelecting(false))
    let [selectedSlips, setSelectedSlips] = useState([])
    let selectedSlipsRef = useRef()
    selectedSlipsRef.current = selectedSlips

    let DOMId = parentId + '-select-slip'
    return containerElement && (
        createPortal(
            <div id = {DOMId} className = 'absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/80 z-30'>
                <div id = {DOMId + '-container'} className = 'relative flex flex-col items-center gap-base p-lg bg-base-highlight rounded-base' ref = {cancelRef}>
                    <div id = {DOMId + '-new-slip'} className = 'group/new-slip flex items-center self-end cursor-pointer' onClick = {() => createNewSlip(expandedPicks)}>
                        <Text id = {DOMId + '-new-slip-text'} preset = 'body' classes = 'text-primary-main group-hover/new-slip:text-primary-highlight'>
                            New Slip
                        </Text>
                        <Plus id = {DOMId + '-new-slip-icon'} className = 'text-xl text-primary-main group-hover/new-slip:text-primary-highlight'/>
                    </div>
                    <Map items = {slips} callback = {(slip, index) => {
                        let slipId = DOMId + '-slip' + index; return (
                        <SelectSlip key = {index} expandedPicks = {expandedPicks} slip = {slip} data = {data} isSelected = {selectedSlips.includes(index)} onSelect = {() => onSelectSlip(index)} parentId = {slipId}/>
                    )}}/>
                    <Conditional value = {slips.length === 0}>
                        <Text id = {DOMId + '-new-slip'} preset = 'body' classes = 'text-text-highlight/killed'>
                            No slips found.
                        </Text>
                    </Conditional>
                    <Check id = {DOMId + '-save'} className = {'transition-colors duration-main self-end text-2xl cursor-pointer ' + (selectedSlips.length > 0 ? 'text-primary-main hover:text-primary-highlight' : 'text-text-highlight/killed')} onClick = {() => selectedSlips.length > 0 ? addToSlips(expandedPicks) : null}/>
                </div>
            </div>
        , containerElement)
    )

    function onSelectSlip(index) {
        if (selectedSlipsRef.current.includes(index)) {
            setSelectedSlips(selectedSlipsRef.current.filter(slip => slip !== index))
        }
        else {
            let newSelectedSlips = JSON.parse(JSON.stringify(selectedSlipsRef.current))
            newSelectedSlips.push(index)
            setSelectedSlips(newSelectedSlips)
        }
    }

    function createNewSlip(expandedPicks) {
        let compressedPicks = expandedPicks.map(pick => compressPick(pick))
        let time = now()
        addSlip({
            id: short.generate(),
            name: toDate(time),
            timestamp: time,
            picks: [...compressedPicks]
        })
    }

    function addToSlips(expandedPicks) {
        for (const index of selectedSlipsRef.current) {
            let compressedSlip = slips[index]
            if (!compressedSlip.picks.some(compressedPick => expandedPicks.some(expandedPick => compressedPick.split('-')[0] === expandedPick.event.id) && expandedPicks.some(expandedPick => compressedPick.split('-')[1] === expandedPick.bet.key))) {
                let newSlip = JSON.parse(JSON.stringify(compressedSlip))
                newSlip.picks = [...newSlip.picks, ...expandedPicks.map(pick => compressPick(pick))]
                editSlip(compressedSlip, newSlip)
                onSelectSlip(index)
            }
        }
    }
}, (b, a) => _.isEqual(b.expandedPicks, a.expandedPicks))

const SelectSlip = memo(function SelectSlip({ slip, expandedPicks, data, isSelected, onSelect, parentId }) {
    let expandedSlip = useMemo(() => {
        let newSlip = JSON.parse(JSON.stringify(slip))
        return {...newSlip, picks: newSlip.picks.map(pick => {
            return expandPick(data.events, pick)
        }).filter(p => p !== null)}
    }, [slip])
    let canAddPicksToSlip = useMemo(() => {
        return !expandedSlip.picks.some(expandedPick => expandedPicks.some(expandedPick2 => expandedPick.event.id === expandedPick2.event.id) && expandedPicks.some(expandedPick2 => expandedPick.bet.key === expandedPick2.bet.key))
    }, [slip, expandedPicks])
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'flex items-center gap-base'>
            <div id = {DOMId + '-info'} className = 'w-full flex flex-col gap-sm'>
                <Text id = {DOMId + '-info-date'} preset = 'body' classes = 'text-text-highlight/killed'>
                    {toDate(expandedSlip.timestamp)}
                </Text>
                <div id = {DOMId + '-info-picks'} className = 'flex flex-col gap-sm'>
                    <Map items = {expandedSlip.picks} callback = {(pick, index) => {
                        let pickId = DOMId + '-info-pick' + index
                        return (
                            <Text key = {index} id = {pickId} preset = 'body' classes = 'text-primary-main'>
                                {pick.outcome.competitor ? pick.outcome.competitor.name : pick.outcome.name}&nbsp;{pick.bet.name}
                            </Text>
                        )}}/>
                </div>
            </div>
            <Conditional value = {!isSelected}>
                <Circle id = {DOMId + '-select'} className = {'transition-all duration-main text-xl ' + (canAddPicksToSlip ? 'text-primary-main/muted hover:text-primary-main cursor-pointer' : 'text-text-highlight/10')} onClick = {() => canAddPicksToSlip ? onSelect() : null}/>
            </Conditional>
            <Conditional value = {isSelected}>
                <PlusCircleFill id = {DOMId + '-select'} className = 'transition-all duration-main text-xl text-primary-main cursor-pointer' onClick = {() => onSelect()}/>
            </Conditional>
        </div>
    )
}, (b, a) => b.isSelected === a.isSelected && _.isEqual(b.expandedPicks, a.expandedPicks) && _.isEqual(b.data, a.data) && _.isEqual(b.slip, a.slip))

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