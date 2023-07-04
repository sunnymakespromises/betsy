import React, { memo, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { FavoriteRounded, FilterAltRounded } from '@mui/icons-material'
import { useSearch } from '../hooks/useSearch'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Text from '../components/text'
import Input from '../components/input'
import Conditional from '../components/conditional'
import Map from '../components/map'

const Search = memo(function Search({ searchConfig, favorites = null, data, onResultClick, parentId, children }) {
    const { input, results, hasResults, filters, setFilter, onInputChange, loadSpace } = useSearch(searchConfig)
    let [isVisible, setIsVisible] = useState(true)
    let clickRef = useCancelDetector(() => hasResults ? setIsVisible(false) : null)
    useEffect(() => {
        if (data) {
            loadSpace(data)
        }
    }, [data])

    useEffect(() => {
        if (input && hasResults && !isVisible) {
            setIsVisible(true)
        }
    }, [input])

    let DOMId = parentId + 'search-'
    return (
        <div id = {DOMId + 'container'} className = 'relative w-full h-full flex flex-col rounded-main overflow-hidden'>
            <div ref = {clickRef} id = {DOMId + 'display'} className = 'z-20'>
                <div id = {DOMId + 'bar'} className = 'relative flex flex-row z-10' onClick = {() => !isVisible ? setIsVisible(true) : null}>
                    <Filters filters = {filters} setFilter = {setFilter} parentId = {DOMId}/>
                    <Input id = {DOMId + 'input'} preset = 'search' status = {null} value = {input} autoFocus onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Search...'} autoComplete = 'off' classes = {'border-b-thin ' + (hasResults && isVisible ? 'rounded-t-main border-divider-highlight' : 'rounded-main border-transparent')}/>
                </div>
                <Results results = {results} favorites = {favorites} hasResults = {hasResults} isVisible = {isVisible} onResultClick = {(category, result) => {setIsVisible(false); onResultClick(category, result)}} parentId = {DOMId}/>
            </div>
            <div id = {DOMId + 'dimmer'} className = {'transition-all duration-main absolute -top-[100%] -left-[100%] w-[9999px] h-[9999px] z-10 ' + (hasResults && isVisible ? 'backdrop-blur-md md:backdrop-blur-lg' : 'pointer-events-none')}/>
            {children}
        </div>
    )
}, (b, a) => _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)) && _.isEqual(b.favorites, a.favorites) && _.isEqual(b.data, a.data) && b.children === a.children)

const Filters = memo(function Filters({ filters, setFilter, parentId }) {
    const [isVisible, setIsVisible] = useState(false)
    const clickRef = useCancelDetector(() => setIsVisible(false))
    let DOMId = parentId + 'filters-'
    return (
        <div ref = {clickRef} id = {DOMId + 'container'} className = 'absolute top-0 bottom-0 right-0 m-auto w-min h-full flex items-center px-main gap-tiny md:gap-small z-20'>
            <Conditional value = {isVisible}>
                <div id = {DOMId + 'icons-container'} className = 'h-6 md:h-6 w-min flex flex-row items-center gap-tiny md:gap-small'>
                    <Map array = {Object.keys(filters)} callback = {(filter, index) => {
                        let filterId = DOMId + 'filter-'; return (
                        <Filter key = {index} filterKey = {filter} filter = {filters[filter]} isActive = {filters[filter].active === true} setFilter = {setFilter} parentId = {filterId}/>
                    )}}/>
                </div>
            </Conditional>
            <div id = {DOMId + 'trigger-container'} title = 'Filters' className = 'flex items-center justify-center h-6 md:h-6 aspect-square cursor-pointer' onClick = {() => setIsVisible(!isVisible)}>
                <FilterAltRounded id = {DOMId + 'trigger'} className = {'!transition-all duration-main !w-full !h-full text-text-main/killed'}/>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(JSON.stringify(b.filters), JSON.stringify(a.filters)))

const Filter = memo(function Filter({ filterKey, filter, isActive, setFilter, parentId }) {
    const Icon = filter.icon
    let DOMId = parentId + filterKey + '-'
    return (
        <div id = {DOMId + 'container'} title = {filter.title} className = 'group/filter flex items-center justify-center h-full aspect-square cursor-pointer' onClick = {() => setFilter(filterKey, !isActive)}>
            <Icon id = {DOMId + 'icon'} className = {'!transition-all duration-main !w-full !h-full ' + (isActive ? 'text-primary-main' : 'text-text-main/killed group-hover/filter:text-primary-main')}/>
        </div>
    )
}, (b, a) => b.filterKey === a.filterKey && _.isEqual(b.filter, a.filter) && b.isActive === a.isActive )

const Results = memo(function Results({ results, favorites, hasResults, isVisible, onResultClick, parentId }) {
    let DOMId = parentId + 'results-'
    return (
        <div id = {parentId + 'results'} className = {'transition-all duration-main absolute top-0 left-0 w-full h-min max-h-[100%] pt-[3.5rem] md:pt-[3.25rem] flex flex-col md:flex-row gap-micro md:gap-smaller overflow-auto no-scrollbar scroll-smooth md:overflow-hidden px-main pb-smaller bg-base-highlight rounded-b-main border-thin border-divider-highlight !animate-duration-150 ' + (hasResults && isVisible ? 'animate-slideInDown' : 'animate-slideOutUp')}>
            <Map array = {results && Object.keys(results)} callback = {(category, categoryIndex) => {
                let categoryId = DOMId + category + '-'; return (
                <Conditional key = {categoryIndex} value = {results[category]?.length > 0}>
                    <div id = {categoryId + 'container'} className = 'w-full flex flex-col md:overflow-hidden'>
                        <div id = {categoryId + 'title-container'} className = 'w-full h-min sticky top-0 bg-base-highlight pt-small z-10'>
                            <Text id = {categoryId + 'title'} preset = 'search-results-category'>
                                {_.startCase(category)}
                            </Text>
                        </div>
                        <div id = {categoryId + 'results-container'} className = 'w-full h-min md:overflow-auto'>
                            <Map array = {results[category]} callback = {(result, resultIndex) => {
                                let resultId = DOMId + result.category + '-result-'; return (
                                <Result key = {resultIndex} item = {result?.item} category = {category} favorites = {favorites} onResultClick = {onResultClick} parentId = {resultId}/>
                            )}}/>
                        </div>
                    </div>
                </Conditional>
            )}}/>
        </div>
    )
}, (b, a) => _.isEqual(b.results, a.results) && _.isEqual(b.favorites, a.favorites) && b.hasResults === a.hasResults && b.isVisible === a.isVisible)

const Result = memo(function Result({ category, item, favorites, onResultClick, parentId }) {
    let isFavorite = useMemo(() => favorites && category !== 'events' && favorites[category]?.some(f => f.id === item.id), [item, favorites])
    let DOMId = parentId + _.snakeCase(item.name) + '-'
    return (
        <div id = {DOMId + 'container'} className = 'group/result transition-all duration-main relative w-full h-min flex flex-row items-center gap-micro cursor-pointer' onClick = {() => onResultClick(category, item)}>
            <Text id = {DOMId + 'name'} preset = 'search-result-title' classes = 'group-hover/result:text-primary-main'>
                {item.name}
            </Text>
            <Conditional value = {category !== 'events' && isFavorite}>
                <FavoriteRounded id = {DOMId + 'favorite'} className = '!w-4 !h-4 text-primary-main'/>
            </Conditional>
        </div>
    )
}, (b, a) => b.category === a.category && _.isEqual(b.item, a.item) && _.isEqual(b.favorites, a.favorites))

export default Search