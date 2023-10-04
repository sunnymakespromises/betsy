import React, { forwardRef, memo, useState } from 'react'
import { Sliders } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Input from '../components/input'
import Conditional from '../components/conditional'
import Map from '../components/map'

const SearchBar = memo(forwardRef(function SearchBar({ input, filters, hasActiveFilter, setFilter, onInputChange, onFocus, preset = 'main', autoFocus = false, classes, parentId }, ref) {
    let DOMId = parentId + '-searchbar'

    return (
        <div ref = {ref} id = {DOMId} className = {'relative h-min z-10' + (classes ? ' ' + classes : '')}>
            <Conditional value = {filters}>
                <Filters filters = {filters} hasActiveFilter = {hasActiveFilter} setFilter = {setFilter} parentId = {DOMId}/>
            </Conditional>
            <Input id = {DOMId + '-input'} preset = {preset} status = {null} value = {input} autoFocus = {autoFocus} onFocus = {handleFocus} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Search...'} autoComplete = 'off'/>
        </div>
    )
    function handleFocus(event) {
        event.target.select()
        if (onFocus) {
            onFocus(event)
        }
    }
}), (b, a) => b.input === a.input && b.hasActiveFilter === a.hasActiveFilter && b.preset === a.preset && b.autoFocus === a.autoFocus && b.classes === a.classes && b.onFocus === a.onFocus && _.isEqual(b.filters, a.filters) && _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)))

const Filters = memo(function Filters({ filters, hasActiveFilter, setFilter, parentId }) {
    let DOMId = parentId + '-filters'
    const [isVisible, setIsVisible] = useState(false)
    const clickRef = useCancelDetector(() => setIsVisible(false))

    if (filters) {
        return (
            <div ref = {clickRef} id = {DOMId} className = 'absolute top-0 bottom-0 right-0 w-min h-full flex justify-end items-center px-base z-20'>
                <div id = {DOMId + '-trigger'} title = 'Filters' className = 'flex items-center justify-center h-[50%] aspect-square cursor-pointer' onClick = {() => setIsVisible(!isVisible)}>
                    <Sliders id = {DOMId + '-trigger-icon'} className = {'transition-colors duration-main w-full h-full ' + ((isVisible || hasActiveFilter) ? 'text-primary-main' : 'text-text-highlight/killed hover:text-primary-main')}/>
                </div>
                <div id = {DOMId + '-icons'} className = {'transition-all duration-main absolute top-full right-0 h-8 flex gap-xs mt-xs py-sm bg-base-main rounded-base overflow-hidden ' + (isVisible ? 'w-min px-sm' : 'w-0 px-0')}>
                    <Map items = {Object.keys(filters)} callback = {(filter, index) => {
                        let filterId = DOMId + '-filter' + index; return (
                        <Filter key = {index} filterKey = {filter} title = {filters[filter].title} icon = {filters[filter].icon} isActive = {filters[filter].active === true} setFilter = {setFilter} parentId = {filterId}/>
                    )}}/>
                </div>
            </div>
        )
    }
}, (b, a) => b.hasActiveFilter === a.hasActiveFilter && _.isEqual(JSON.stringify(b.filters), JSON.stringify(a.filters)))

const Filter = memo(function Filter({ filterKey, title, icon, isActive, setFilter, parentId }) {
    let DOMId = parentId
    const Icon = icon
    
    return (
        <div id = {DOMId} title = {title} className = 'group/filter flex items-center justify-center h-full aspect-square cursor-pointer' onClick = {() => setFilter(filterKey, !isActive)}>
            <Icon id = {DOMId + '-icon'} className = {'!transition-colors duration-main w-full h-full ' + (isActive ? 'text-primary-main' : 'text-text-highlight/killed group-hover/filter:text-primary-main')}/>
        </div>
    )
}, (b, a) => b.filterKey === a.filterKey && b.title === a.title && _.isEqual(b.icon, a.icon) && b.isActive === a.isActive)

export default SearchBar