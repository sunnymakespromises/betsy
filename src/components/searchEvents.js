import React, { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, StopwatchFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { createPortal } from 'react-dom'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { useDataContext } from '../contexts/data'
import { SearchEventsProvider } from '../contexts/searchEvents'
import { useSearch } from '../hooks/useSearch'
import { useStore } from '../hooks/useStore'
import SearchBar from './searchBar'
import Conditional from './conditional'
import Map from './map'
import Event from './event'
import Text from './text'
import Button from './button'
import now from '../lib/util/now'
import { default as short } from 'short-uuid'


const SearchEvents = memo(function SearchEvents({ compressedSlip, setIsSearching, parentId }) {
    let DOMId = parentId + '-search-events'
    let [, addCompressedSlip, , editCompressedSlip, ] = useStore('user_slips', 'array')
    let { data } = useDataContext()
    let [selectedPicks, setSelectedPicks] = useState([])
    let selectedPicksRef = useRef()
    selectedPicksRef.current = selectedPicks
    let [containerElement, setContainerElement] = useState()
    useLayoutEffect(() => {
        if (!containerElement && document.getElementById('body')) {
             setContainerElement(document.getElementById('body'))
        }
    }, [])
    let cancelRef = useCancelDetector(() => setIsSearching(false))
    const searchConfig = useMemo(() => { return {
        id: 'search_events',
        filters: {
            live: {
                title: 'Upcoming Events',
                icon: (props) => <StopwatchFill {...props}/>,
                fn: (a) => a.filter(r => r.start_time < now() + 60*60*24*3),
                turnsOff: []
            },
        },
        space: data?.events?.filter(event => !event.is_completed),
        minimumLength: 2,
        shape: 'array',
        keys: ['name', 'competition.name', 'competitors.name', 'sport.name'],
    }}, [data])
    const search = useSearch(searchConfig)
    const context = { onSelectPick: onSelectPick, selectedPicks: selectedPicks, canAddPickToSlip: canAddPickToSlip }

    return containerElement && (
        createPortal(
            <SearchEventsProvider value = {context}>
                <div id = {DOMId} className = 'absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/80 z-30'>
                    <div id = {DOMId + '-container'} className = 'relative w-[90%] md:w-[50%] h-[90%] md:h-[80%] flex flex-col items-center gap-base md:gap-lg p-base md:p-lg bg-base-highlight rounded-base overflow-hidden' ref = {cancelRef}>
                        <SearchBar {...search} classes = 'w-full' isExpanded = {false} canExpand = {false} parentId = {DOMId}/>
                        <div id = {DOMId + '-events'} className = 'grow w-full flex flex-col gap-lg overflow-auto'>
                            <Conditional value = {search.results.length > 0}>
                                <Map items = {search.results} callback = {(event, index) => {
                                    let eventId = DOMId + '-event' + index; return (
                                    <Event key = {index} event = {event} events = {data.events} parentId = {eventId}/>
                                )}}/>
                            </Conditional>
                            <Conditional value = {search.results.length < 1 && search.input >= 2}>
                                <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                                    No events found.
                                </Text>
                            </Conditional>
                        </div>
                        <Button id = {DOMId + '-save'} preset = 'main' classes = {'self-end' + (selectedPicks.length === 0 ? ' !bg-base-main hover:!bg-base-main !cursor-default' : '')} onClick = {selectedPicks.length > 0 ? () => addToCompressedSlip() : null}>
                            <Check id = {DOMId + '-save-icon'} className = {'text-xl ' + (selectedPicks.length > 0 ? 'text-text-primary' : 'text-text-highlight/killed')}/>
                            <Text id = {DOMId + '-save-text'} preset = 'body' classes = {(selectedPicks.length > 0 ? 'text-text-primary' : 'text-text-highlight/killed')}>
                                Save
                            </Text>
                        </Button>
                    </div>
                </div>
            </SearchEventsProvider>
        , containerElement)
    )

    function onSelectPick(compressedPick) {
        if (selectedPicksRef.current.includes(compressedPick)) {
            setSelectedPicks(selectedPicksRef.current.filter(pick => pick !== compressedPick))
        }
        else {
            let newSelectedSlips = JSON.parse(JSON.stringify(selectedPicksRef.current))
            newSelectedSlips.push(compressedPick)
            setSelectedPicks(newSelectedSlips)
        }
    }

    function addToCompressedSlip() {
        if (compressedSlip) {
            if (!compressedSlip.picks.some(compressedPick => selectedPicksRef.current.some(compressedPick2 => compressedPick2.split('-')[0] === compressedPick.split('-')[0] && compressedPick2.split('-')[1] === compressedPick.split('-')[1]))) {
                let newCompressedSlip = JSON.parse(JSON.stringify(compressedSlip))
                newCompressedSlip.picks = [...newCompressedSlip.picks, ...selectedPicksRef.current]
                editCompressedSlip(compressedSlip, newCompressedSlip)
                setSelectedPicks([])
            }
        }
        else {
            let compressedPicks = selectedPicksRef.current
            let time = now()
            addCompressedSlip({
                id: short.generate(),
                timestamp: time,
                picks: [...compressedPicks]
            })
        }
    }

    function canAddPickToSlip(compressedPick) {
        if (compressedSlip) {
            return !compressedSlip.picks.some(compressedPick2 => compressedPick2.split('-')[0] === compressedPick.split('-')[0] && compressedPick2.split('-')[1] === compressedPick.split('-')[1])
        }
        return true
    }
}, (b, a) => _.isEqual(b.compressedSlip, a.compressedSlip))

export default SearchEvents