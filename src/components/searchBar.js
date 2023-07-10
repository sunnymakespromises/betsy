import React, { forwardRef, memo, useState } from 'react'
import _ from 'lodash'
import { FilterAltRounded } from '@mui/icons-material'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Input from '../components/input'
import Conditional from '../components/conditional'
import Map from '../components/map'

const SearchBar = memo(forwardRef(function SearchBar({ input, hasResults, filters, setFilter, onInputChange, isExpanded, setIsExpanded, canExpand = true, inputPreset = 'search', autoFocus = true, classes, parentId }, ref) {
    let DOMId = parentId + 'search-'
    return (
        <div ref = {ref} id = {DOMId + 'bar'} className = {'relative h-min' + (classes ? ' ' + classes : '')}>
            <Conditional value = {filters}>
                <Filters filters = {filters} setFilter = {setFilter} parentId = {DOMId}/>
            </Conditional>
            <Input id = {DOMId + 'input'} preset = {inputPreset} status = {null} value = {input} autoFocus = {autoFocus} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Search...'} autoComplete = 'off' onClick = {() => !isExpanded && canExpand ? setIsExpanded(true) : null} classes = {'md:shadow-sm border-thin border-divider-main ' + (canExpand && hasResults && isExpanded ? 'rounded-t-small' : 'rounded-small')}/>
        </div>
    )
}), (b, a) => b.input === a.input && b.hasResults === a.hasResults && b.isExpanded === a.isExpanded && b.inputPreset === a.inputPreset && b.autoFocus === a.autoFocus && b.canExpand === a.canExpand && b.classes === a.classes && _.isEqual(b.filters, a.filters) && _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)))

const Filters = memo(function Filters({ filters, setFilter, parentId }) {
    const [isVisible, setIsVisible] = useState(false)
    const clickRef = useCancelDetector(() => setIsVisible(false))
    let DOMId = parentId + 'filters-'
    if (filters) {
        return (
            <div ref = {clickRef} id = {DOMId + 'container'} className = 'absolute top-0 bottom-0 right-0 m-auto w-min h-full flex items-center px-main gap-tiny md:gap-small z-20'>
                <Conditional value = {isVisible}>
                    <div id = {DOMId + 'icons-container'} className = 'h-[50%] w-min flex flex-row items-center gap-tiny md:gap-small'>
                        <Map array = {Object.keys(filters)} callback = {(filter, index) => {
                            let filterId = DOMId + 'filter-'; return (
                            <Filter key = {index} filterKey = {filter} filter = {filters[filter]} isActive = {filters[filter].active === true} setFilter = {setFilter} parentId = {filterId}/>
                        )}}/>
                    </div>
                </Conditional>
                <div id = {DOMId + 'trigger-container'} title = 'Filters' className = 'flex items-center justify-center h-[50%] aspect-square cursor-pointer' onClick = {() => setIsVisible(!isVisible)}>
                    <FilterAltRounded id = {DOMId + 'trigger'} className = {'!w-full !h-full text-text-highlight/killed'}/>
                </div>
            </div>
        )
    }
}, (b, a) => _.isEqual(JSON.stringify(b.filters), JSON.stringify(a.filters)))

const Filter = memo(function Filter({ filterKey, filter, isActive, setFilter, parentId }) {
    const Icon = filter.icon
    let DOMId = parentId + filterKey + '-'
    return (
        <div id = {DOMId + 'container'} title = {filter.title} className = 'group/filter flex items-center justify-center h-full aspect-square cursor-pointer' onClick = {() => setFilter(filterKey, !isActive)}>
            <Icon id = {DOMId + 'icon'} className = {'!w-full !h-full ' + (isActive ? 'text-primary-main' : 'text-text-highlight/killed group-hover/filter:text-primary-main')}/>
        </div>
    )
}, (b, a) => b.filterKey === a.filterKey && b.isActive === a.isActive && _.isEqual(b.filter, a.filter))

export default SearchBar