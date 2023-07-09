import React, { forwardRef, memo, useEffect, useState } from 'react'
import _ from 'lodash'
import { useSearch } from '../hooks/useSearch'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Text from '../components/text'
import Conditional from '../components/conditional'
import Map from '../components/map'
import { useSizeDetector } from '../hooks/useSizeDetector'
import SearchBar from './searchBar'
import { useFavorite } from '../hooks/useFavorite'
import Image from './image'

const Search = memo(forwardRef(function Search({ searchConfig, onResultClick, inputPreset = 'search', classes, parentId }, ref) {
    const { input, results, hasResults, filters, setFilter, onInputChange } = useSearch(searchConfig)
    let [isExpanded, setIsExpanded] = useState(true)
    let cancelRef = useCancelDetector(() => hasResults ? setIsExpanded(false) : null)
    let [barSizeRef, barSize] = useSizeDetector()

    useEffect(() => {
        if (input && hasResults && !isExpanded) {
            setIsExpanded(true)
        }
    }, [input])

    let DOMId = parentId + 'search-'
    return (
        <div ref = {(el) => {cancelRef.current = el; if (ref) {ref.current = el}}} id = {DOMId + 'container'} className = {'w-full flex flex-col rounded-main' + (classes ? ' ' + classes : '')}>
            <SearchBar input = {input} ref = {barSizeRef} hasResults = {hasResults} filters = {filters} setFilter = {setFilter} onInputChange = {onInputChange} isExpanded = {isExpanded} setIsExpanded = {setIsExpanded} canExpand = {true} inputPreset = {inputPreset} parentId = {DOMId}/>
            <Results results = {results} hasResults = {hasResults} isExpanded = {isExpanded} offset = {barSize.height} onResultClick = {(category, result) => {setIsExpanded(false); onResultClick(category, result)}} parentId = {DOMId}/>
        </div>
    )
}), (b, a) => _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)) && b.classes === a.classes)

const Results = memo(function Results({ results, hasResults, isExpanded, offset, onResultClick, parentId }) {
    let maxHeight = 'calc(100% - ' + offset + 'px)'
    let DOMId = parentId + 'results-'
    if (results?.constructor?.name === 'Object') {
        return (
            <div id = {parentId + 'results'} style = {{ maxHeight: maxHeight, marginTop: offset + 'px' }} className = {'absolute top-0 left-0 right-0 flex-col md:flex-row gap-micro md:gap-smaller overflow-auto no-scrollbar scroll-smooth md:overflow-hidden p-main pt-0 bg-base-main rounded-b-main shadow border-thin border-t-0 border-divider-main z-20 ' + (hasResults && isExpanded ? 'flex' : 'hidden')}>
                <Map array = {results && Object.keys(results)} callback = {(category, categoryIndex) => {
                    let categoryId = DOMId + category + '-'; return (
                    <Conditional key = {categoryIndex} value = {results[category]?.length > 0}>
                        <div id = {categoryId + 'container'} className = 'w-full flex flex-col md:overflow-hidden'>
                            <div id = {categoryId + 'title-container'} className = 'w-full h-min sticky top-0 bg-base-main pt-main z-10'>
                                <Text id = {categoryId + 'title'} preset = 'search-results-category'>
                                    {_.startCase(category)}
                                </Text>
                            </div>
                            <div id = {categoryId + 'results-container'} className = 'w-full h-min md:overflow-auto no-scrollbar'>
                                <Map array = {results[category]} callback = {(result, resultIndex) => {
                                    let resultId = DOMId + result.category + '-result-'; return (
                                    <Result key = {resultIndex} item = {result} category = {category} onResultClick = {onResultClick} parentId = {resultId}/>
                                )}}/>
                            </div>
                        </div>
                    </Conditional>
                )}}/>
            </div>
        )
    }
    else {
        return (
            <div id = {parentId + 'results'} style = {{ maxHeight: maxHeight, marginTop: offset + 'px' }} className = {'absolute top-0 left-0 w-full min-h-0 flex-col overflow-auto no-scrollbar scroll-smooth md:overflow-hidden px-main py-small bg-base-main rounded-b-main shadow border-thin border-t-0 border-divider-main z-20 ' + (hasResults && isExpanded ? 'flex' : 'hidden')}>
                <Map array = {results} callback = {(result, resultIndex) => {
                    let resultId = DOMId + 'result-' + resultIndex + '-'; return (
                    <Result key = {resultIndex} item = {result} onResultClick = {onResultClick} parentId = {resultId}/>
                )}}/>
            </div>
        )
    }
}, (b, a) => _.isEqual(b.results, a.results) && b.hasResults === a.hasResults && b.isExpanded === a.isExpanded && b.offset === a.offset)

const Result = memo(function Result({ category, item, onResultClick, parentId }) {
    let { isFavorite, Favorite } = useFavorite(category, item)
    let DOMId = parentId
    return (
        <div id = {DOMId + 'container'} className = 'group/result transition-all duration-main relative w-full h-min flex flex-row items-center gap-tiny cursor-pointer' onClick = {() => onResultClick(category, item)}>
            <Conditional value = {item.picture}>
                <Image id = {parentId + 'image'} external path = {item.picture} classes = 'h-4 aspect-square'/>
            </Conditional>
            <Text id = {DOMId + 'name'} preset = 'search-result-title' classes = 'group-hover/result:text-primary-main'>
                {item.name}
            </Text>
            <Conditional value = {category !== 'events' && isFavorite}>
                <Favorite isFavorite = {isFavorite} category = {category} canEdit = {false} item = {item} classes = '!h-4 !w-4' parentId = {parentId}/>
            </Conditional>
        </div>
    )
}, (b, a) => b.category === a.category && _.isEqual(b.item, a.item))

export default Search