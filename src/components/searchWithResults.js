import React, { forwardRef, memo, useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { useSearch } from '../hooks/useSearch'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Text from './text'
import Conditional from './conditional'
import Map from './map'
import { useSizeDetector } from '../hooks/useSizeDetector'
import SearchBar from './searchBar'
import { useFavorite } from '../hooks/useFavorite'
import Image from './image'
import { useKeyListener } from '../hooks/useKeyListener'
import SimpleBar from 'simplebar-react';
import { usePrevious } from '@dnd-kit/utilities'

const SearchWithResults = memo(forwardRef(function Search({ searchConfig, onResultClick, closeOnClick = true, inputPreset = 'search', autoFocus = false, showFavorites = true, classes, container, parentId }, ref) {
    const { input, results, hasResults, filters, hasActiveFilter, setFilter, onInputChange } = useSearch(searchConfig)
    const previousInput = usePrevious(input)
    let resultsShape = useMemo(() => results && results.constructor.name === 'Array' ? 'array' : 'object', [results])
    let [isExpanded, setIsExpanded] = useState(false)
    let cancelRef = useCancelDetector(() => hasResults && setIsExpanded(false))
    let [barSizeRef, barSize] = useSizeDetector()
    useKeyListener(['Enter'], () => {
        if (input && hasResults) {
            if (resultsShape === 'array') {
                onClick(results[0].category, results[0].item)
            }
            else if (resultsShape === 'object') {
                let firstCategory = Object.keys(results).filter(category => results[category].length > 0)[0]
                onClick(firstCategory, results[firstCategory][0])
            }
        }
    })
    let [, containerSize] = useSizeDetector(container)

    useEffect(() => {

    }, [isExpanded])

    useEffect(() => {
        if (previousInput !== undefined) {
            onFocus()
        }
    }, [input])

    let DOMId = parentId + '-search'
    return (
        <div ref = {(el) => {cancelRef.current = el; if (ref) {ref.current = el}}} id = {DOMId} className = {'relative flex flex-col rounded-main' + (classes ? ' ' + classes : '')}>
            <SearchBar input = {input} ref = {barSizeRef} hasResults = {hasResults} filters = {filters} hasActiveFilter = {hasActiveFilter} setFilter = {setFilter} onInputChange = {onInputChange} onFocus = {onFocus} isExpanded = {isExpanded} setIsExpanded = {setIsExpanded} canExpand = {true} autoFocus = {autoFocus} inputPreset = {inputPreset} parentId = {DOMId}/>
            {results && <Results results = {results} hasResults = {hasResults} shape = {resultsShape} isExpanded = {isExpanded} bar = {barSize} container = {containerSize} showFavorites = {showFavorites} onResultClick = {(category, result) => onClick(category, result)} parentId = {DOMId}/>}
        </div>
    )

    function onFocus() {
        if (input && hasResults && !isExpanded) {
            setIsExpanded(true)
        }
    }

    function onClick(category, result) {
        if (closeOnClick) {
            setIsExpanded(false)
        }
        onResultClick(category, result)
    }
}), (b, a) => b.classes === a.classes && b.container === a.container && b.autoFocus === a.autoFocus && b.showFavorites === a.showFavorites && _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)))

const Results = memo(function Results({ results, hasResults, shape, isExpanded, bar, container, showFavorites, onResultClick, parentId }) {
    let maxHeight = useMemo(() => container?.bottom && bar?.bottom ? 'calc(' + container?.bottom + 'px - ' + bar.bottom + 'px - 0.75rem)' : '100%', [bar, container])
    let categories = useMemo(() => results && Object.keys(results).filter(category => results[category].length > 0), [results])
    let DOMId = parentId + '-results'
    if (shape === 'object') {
        return (
            <div id = {DOMId} style = {{ maxHeight: maxHeight, marginTop: bar.height + 'px' }} className = {'absolute top-0 left-0 right-0 transition-all duration-main flex flex-col overflow-auto scroll-smooth bg-base-main rounded-b-main shadow border-divider-main z-20 ' + (hasResults && isExpanded ? 'border-thin border-t-0' : '!max-h-0')}>
                <SimpleBar>
                    <Map array = {categories} callback = {(category, categoryIndex) => {
                        let categoryId = DOMId + '-' + category; return (
                        <React.Fragment key = {categoryIndex}>
                            <div id = {categoryId + '-items'} className = 'w-full h-min'>
                                <Map array = {results[category]} callback = {(result, resultIndex) => {
                                    let resultId = DOMId + '-result' + resultIndex; return (
                                    <Result key = {resultIndex} index = {resultIndex} item = {result} category = {category} showFavorites = {showFavorites} onResultClick = {onResultClick} parentId = {resultId}/>
                                )}}/>
                            </div>
                            <Conditional value = {categoryIndex !== categories.length - 1}>
                                <div className = 'border-t-thin border-divider-main'/>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </SimpleBar>
            </div>
        )
    }
    else if (shape === 'array') {
        return (
            <div id = {DOMId} style = {{ maxHeight: maxHeight, marginTop: bar.height + 'px' }} className = {'absolute top-0 left-0 w-full min-h-0 flex-col overflow-auto scroll-smooth bg-base-main rounded-b-main shadow border-thin border-t-0 border-divider-main z-20 ' + (hasResults && isExpanded ? 'flex' : 'hidden')}>
                <Map array = {results} callback = {(result, resultIndex) => {
                    let resultId = DOMId + '-result' + resultIndex; return (
                    <Result key = {resultIndex} index = {resultIndex} item = {result.item} category = {result.category} showFavorites = {showFavorites} onResultClick = {onResultClick} parentId = {resultId}/>
                )}}/>
            </div>
        )
    }
}, (b, a) => b.hasResults === a.hasResults && b.shape === a.shape && b.isExpanded === a.isExpanded && b.showFavorites === a.showFavorites && _.isEqual(b.bar, a.bar) && _.isEqual(b.container, a.container) && _.isEqual(b.results, a.results))

const Result = memo(function Result({ index, category, item, showFavorites, onResultClick, parentId }) {
    let [isFavorite, Favorite] = useFavorite(category, item)
    let title = useMemo(() => {
        let DOMId = parentId + '-title'
        if (category === 'competitors' || category === 'competitions') {
            return (
                <>
                    <Conditional value = {item.picture}>
                        <Image id = {DOMId + '-image'} external path = {item.picture} classes = 'h-4 w-4'/>
                    </Conditional>
                    <Text id = {DOMId + '-name'} preset = 'search-result-title' classes = 'group-hover/result:text-primary-main'>
                        {item.name}
                    </Text>
                </>
            )
        }
        else if (category === 'events') {
            if (item.is_outright) {
                return (
                    <Text id = {DOMId + '-name'} preset = 'search-result-title' classes = 'group-hover/result:text-primary-main'>
                        {item.name}
                    </Text>
                )
            }
            else {
                return (
                    <>
                        <div id = {DOMId + '-competitor0'} className = 'flex flex-row items-center gap-tiny overflow-hidden'>
                            <Conditional value = {item.competitors[0].picture}>
                                <Image id = {DOMId + '-competitor0-image'} external path = {item.competitors[0].picture} classes = 'h-4 w-4'/>
                            </Conditional>
                            <Text id = {DOMId + '-competitor0-name'} preset = 'search-result-title' classes = 'group-hover/result:text-primary-main'>
                                {item.competitors[0].name}
                            </Text>
                        </div>
                        <Text id = {DOMId + '-competitors-separator'} preset = 'search-result-title'>
                            {item.name.includes('@') ? '@' : 'v'}
                        </Text>
                        <div id = {DOMId + '-competitor1'} className = 'flex flex-row items-center gap-tiny overflow-hidden'>
                            <Conditional value = {item.competitors[1].picture}>
                                <Image id = {DOMId + '-competitor1-image'} external path = {item.competitors[1].picture} classes = 'h-4 w-4'/>
                            </Conditional>
                            <Text id = {DOMId + '-competitor1-name'} preset = 'search-result-title' classes = 'group-hover/result:text-primary-main'>
                                {item.competitors[1].name}
                            </Text>
                        </div>
                    </>
                )
            }
        }
        return <></>
    }, [item, category])

    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'group/result transition-all duration-main relative w-full h-min flex flex-row items-center px-main py-small gap-tiny cursor-pointer ' + (index % 2 === 0 ? 'bg-base-highlight' : 'bg-base-main')} onClick = {() => onResultClick(category, item)}>
            {title}
            <Conditional value = {category !== 'events' && showFavorites}>
                <Favorite isFavorite = {isFavorite} category = {category} canEdit = {true} item = {item} classes = '!h-4 !w-4' parentId = {DOMId}/>
            </Conditional>
        </div>
    )
}, (b, a) => b.index === a.index && b.category === a.category && b.showFavorites === a.showFavorites && _.isEqual(b.item, a.item))

export default SearchWithResults