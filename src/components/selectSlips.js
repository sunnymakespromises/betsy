import React, { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Circle, Plus, PlusCircleFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { useStore } from '../hooks/useStore'
import Text from './text'
import Conditional from './conditional'
import Map from './map'
import toDate from '../lib/util/toDate'
import { compressPick, expandSlip } from '../lib/util/manipulateBets'
import now from '../lib/util/now'
import { default as short } from 'short-uuid'
import Button from './button'

const SelectSlips = memo(function Select({ expandedPicksToAdd, events, setIsSelecting, parentId }) {
    let DOMId = parentId + '-select-slip'
    let [compressedSlips, addCompressedSlip, , editCompressedSlip, ] = useStore('user_slips', 'array')
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

    return containerElement && (
        createPortal(
            <div id = {DOMId} className = 'absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/80 z-30'>
                <div id = {DOMId + '-container'} className = 'relative w-[90%] md:w-[50%] h-[90%] md:h-[80%] flex flex-col items-center gap-base p-lg bg-base-highlight rounded-base overflow-hidden' ref = {cancelRef}>
                    <Button id = {DOMId + '-new'} preset = 'main' classes = 'absolute top-lg right-lg self-end' onClick = {() => createNewCompressedSlip(expandedPicksToAdd)}>
                        <Plus id = {DOMId + '-new-icon'} className = 'text-xl text-text-primary'/>
                            <Text id = {DOMId + '-new-text'} preset = 'body' classes = 'text-text-primary'>
                                New Slip
                            </Text>
                    </Button>
                    <div id = {DOMId + '-slips'} className = 'grow w-full flex flex-col gap-base flex-wrap overflow-hidden'>
                        <Map items = {compressedSlips} callback = {(compressedSlip, index) => {
                            let slipId = DOMId + '-slip' + index; return (
                            <SelectSlip key = {index} expandedPicksToAdd = {expandedPicksToAdd} expandedSlip = {expandSlip(events, compressedSlip)} isSelected = {selectedSlips.includes(index)} onSelect = {() => onSelectSlip(index)} parentId = {slipId}/>
                        )}}/>
                        <Conditional value = {compressedSlips.length === 0}>
                            <Text id = {DOMId + '-new-slip'} preset = 'body' classes = 'text-text-highlight/killed'>
                                No slips found.
                            </Text>
                        </Conditional>
                    </div>
                    <Button id = {DOMId + '-save'} preset = 'main' classes = {'self-end' + (selectedSlips.length === 0 ? ' !bg-base-main hover:!bg-base-main !cursor-default' : '')} onClick = {selectedSlips.length > 0 ? () => { addToCompressedSlips(expandedPicksToAdd); setIsSelecting(false)} : null}>
                        <Check id = {DOMId + '-save-icon'} className = {'text-xl ' + (selectedSlips.length > 0 ? 'text-text-primary' : 'text-text-highlight/killed')}/>
                        <Text id = {DOMId + '-save-text'} preset = 'body' classes = {(selectedSlips.length > 0 ? 'text-text-primary' : 'text-text-highlight/killed')}>
                            Save
                        </Text>
                    </Button>
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

    function createNewCompressedSlip(expandedPicks) {
        let compressedPicks = expandedPicks.map(expandedPick => compressPick(expandedPick))
        let time = now()
        addCompressedSlip({
            id: short.generate(),
            timestamp: time,
            picks: [...compressedPicks]
        })
    }

    function addToCompressedSlips(expandedPicks) {
        for (const index of selectedSlipsRef.current) {
            let compressedSlip = compressedSlips[index]
            if (!compressedSlip.picks.some(compressedPick => expandedPicks.some(expandedPick => compressedPick.split('-')[0] === expandedPick.event.id) && expandedPicks.some(expandedPick => compressedPick.split('-')[1] === expandedPick.bet.key))) {
                let newCompressedSlip = JSON.parse(JSON.stringify(compressedSlip))
                newCompressedSlip.picks = [...newCompressedSlip.picks, ...expandedPicks.map(expandedPick => compressPick(expandedPick))]
                editCompressedSlip(compressedSlip, newCompressedSlip)
                onSelectSlip(index)
            }
        }
    }
}, (b, a) => _.isEqual(b.expandedPicks, a.expandedPicks) && _.isEqual(b.events, a.events))

const SelectSlip = memo(function SelectSlip({ expandedSlip, expandedPicksToAdd, isSelected, onSelect, parentId }) {
    let DOMId = parentId
    let canAddPicksToSlip = useMemo(() => {
        return !expandedSlip.picks.some(expandedPick => expandedPicksToAdd.some(expandedPick2 => expandedPick.event.id === expandedPick2.event.id) && expandedPicksToAdd.some(expandedPick2 => expandedPick.bet.key === expandedPick2.bet.key))
    }, [expandedSlip, expandedPicksToAdd])
    
    return (
        <div id = {DOMId} className = 'w-min flex items-center gap-base'>
            <div id = {DOMId + '-info'} className = 'w-full flex flex-col gap-xs'>
                <Text id = {DOMId + '-info-date'} preset = 'body' classes = 'text-text-highlight/killed whitespace-nowrap'>
                    {toDate(expandedSlip.timestamp)}
                </Text>
                <div id = {DOMId + '-info-picks'} className = 'flex flex-col gap-sm'>
                    <Map items = {expandedSlip.picks} callback = {(expandedPick, index) => {
                        let expandedPickId = DOMId + '-info-pick' + index; return (
                        <Text key = {index} id = {expandedPickId} preset = 'body' classes = 'text-primary-main whitespace-nowrap'>
                            {expandedPick.outcome.competitor ? expandedPick.outcome.competitor.name : expandedPick.outcome.name}&nbsp;{expandedPick.bet.name}
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
}, (b, a) => b.isSelected === a.isSelected && _.isEqual(b.expandedPicksToAdd, a.expandedPicksToAdd) && _.isEqual(b.expandedSlip, a.expandedSlip))

export default SelectSlips