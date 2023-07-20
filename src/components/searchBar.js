import React, { forwardRef, memo, useState } from 'react'
import _ from 'lodash'
import { FilterAltRounded } from '@mui/icons-material'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Input from '../components/input'
import Conditional from '../components/conditional'
import Map from '../components/map'

const SearchBar = memo(forwardRef(function SearchBar({ input, hasResults, filters, hasActiveFilter, setFilter, onInputChange, onFocus, isExpanded, setIsExpanded, canExpand = true, inputPreset = 'search', autoFocus = false, classes, parentId }, ref) {
    let DOMId = parentId + '-searchbar'
    return (
        <div ref = {ref} id = {DOMId} className = {'relative h-min' + (classes ? ' ' + classes : '')}>
            <Conditional value = {filters}>
                <Filters filters = {filters} hasActiveFilter = {hasActiveFilter} setFilter = {setFilter} parentId = {DOMId}/>
            </Conditional>
            <Input id = {DOMId + '-input'} preset = {inputPreset} status = {null} value = {input} autoFocus = {autoFocus} onFocus = {handleFocus} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Search...'} autoComplete = 'off' onClick = {() => !isExpanded && canExpand && setIsExpanded(true)} classes = {'transition-all duration-main shadow-sm md:shadow border-thin border-divider-main hover:bg-base-highlight ' + (canExpand && hasResults && isExpanded ? 'rounded-t-small' : 'rounded-small')}/>
        </div>
    )
    function handleFocus(event) {
        event.target.select()
        if (onFocus) {
            onFocus(event)
        }
    }
}), (b, a) => b.input === a.input && b.hasResults === a.hasResults && b.hasActiveFilter === a.hasActiveFilter && b.isExpanded === a.isExpanded && b.inputPreset === a.inputPreset && b.autoFocus === a.autoFocus && b.canExpand === a.canExpand && b.classes === a.classes && _.isEqual(b.filters, a.filters) && _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)))

const Filters = memo(function Filters({ filters, hasActiveFilter, setFilter, parentId }) {
    const [isVisible, setIsVisible] = useState(false)
    const clickRef = useCancelDetector(() => setIsVisible(false))
    let DOMId = parentId + '-filters'
    if (filters) {
        return (
            <div ref = {clickRef} id = {DOMId} className = 'absolute top-0 bottom-0 right-0 m-auto w-min h-full flex items-center px-main gap-tiny md:gap-small z-20'>
                <Conditional value = {isVisible}>
                    <div id = {DOMId + '-icons'} className = {'h-[50%] w-min flex flex-row items-center gap-tiny md:gap-small !animate-duration-150 animate-fadeInRight'}>
                        <Map array = {Object.keys(filters)} callback = {(filter, index) => {
                            let filterId = DOMId + '-filter' + index; return (
                            <Filter key = {index} filterKey = {filter} filter = {filters[filter]} isActive = {filters[filter].active === true} setFilter = {setFilter} parentId = {filterId}/>
                        )}}/>
                    </div>
                </Conditional>
                <div id = {DOMId + '-trigger'} title = 'Filters' className = 'flex items-center justify-center h-[50%] aspect-square cursor-pointer' onClick = {() => setIsVisible(!isVisible)}>
                    <FilterAltRounded id = {DOMId + '-trigger-icon'} className = {'!transition-colors duration-main !w-full !h-full ' + ((isVisible || hasActiveFilter) ? 'text-primary-main' : 'text-text-highlight/killed hover:text-primary-main')}/>
                </div>
            </div>
        )
    }
}, (b, a) => b.hasActiveFilter === a.hasActiveFilter && _.isEqual(JSON.stringify(b.filters), JSON.stringify(a.filters)))

const Filter = memo(function Filter({ filterKey, filter, isActive, setFilter, parentId }) {
    const Icon = filter.icon
    let DOMId = parentId
    return (
        <div id = {DOMId} title = {filter.title} className = 'group/filter flex items-center justify-center h-full aspect-square cursor-pointer' onClick = {() => setFilter(filterKey, !isActive)}>
            <Icon id = {DOMId + '-icon'} className = {'!transition-colors duration-main !w-full !h-full ' + (isActive ? 'text-primary-main' : 'text-text-highlight/killed group-hover/filter:text-primary-main')}/>
        </div>
    )
}, (b, a) => b.filterKey === a.filterKey && b.isActive === a.isActive && _.isEqual(b.filter, a.filter))

export default SearchBar