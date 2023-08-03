import React, { forwardRef, memo, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import { useSearch } from '../hooks/useSearch'
import { useFavorite } from '../hooks/useFavorite'
import { useKeyListener } from '../hooks/useKeyListener'
import { usePrevious } from '../hooks/usePrevious'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Text from './text'
import Conditional from './conditional'
import Map from './map'
import SearchBar from './searchBar'
// import Image from './image'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'

const SearchWithResults = memo(forwardRef(function Search({ searchConfig, onResultClick, closeOnClick = false, preset = 'main', autoFocus = false, classes, container, parentId }, ref) {
    const search = useSearch(searchConfig)
    const previousInput = usePrevious(search.input)
    let resultsShape = useMemo(() => search.results && search.results.constructor.name === 'Array' ? 'array' : 'object', [search.results])
    let [isExpanded, setIsExpanded] = useState(false)
    let [containerElement, setContainerElement] = useState()
    let cancelRef = useCancelDetector(() => {
        search.hasResults && setIsExpanded(false)
    }, [parentId + '-search-searchbar'])

    useKeyListener(['Enter'], () => {
        if (search.input && search.hasResults) {
            if (resultsShape === 'array') {
                onClick(search.results[0].category, search.results[0].item)
            }
            else if (resultsShape === 'object') {
                let firstCategory = Object.keys(search.results).filter(category => search.results[category].length > 0)[0]
                onClick(firstCategory, search.results[firstCategory][0])
            }
        }
    })

    useLayoutEffect(() => {
       if (!containerElement && document.getElementById(container)) {
            setContainerElement(document.getElementById(container))
       }
    }, [])

    useEffect(() => {
        if (previousInput !== undefined) {
            onFocus()
        }
    }, [search.input])

    function onFocus() {
        setIsExpanded(true)
    }

    let DOMId = parentId + '-search'
    return (
        <div ref = {ref} id = {DOMId} className = {'relative flex flex-col rounded-main' + (classes ? ' ' + classes : '')}>
            <SearchBar {...search} onFocus = {onFocus} autoFocus = {autoFocus} preset = {preset} parentId = {DOMId}/>
            {containerElement && createPortal(<Results ref = {cancelRef} results = {search.results} hasResults = {search.hasResults} shape = {resultsShape} isExpanded = {isExpanded} onResultClick = {(category, result) => onClick(category, result)} resultIsLink = {!onResultClick} parentId = {DOMId}/>, containerElement)}
        </div>
    )

    function onClick(category, result) {
        if (onResultClick) {
            onResultClick(category, result)
        }
        if (closeOnClick) {
            setIsExpanded(false)
        }
    }
}), (b, a) => b.classes === a.classes && b.container === a.container && b.autoFocus === a.autoFocus && _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)))

const Results = memo(forwardRef(function Results({ results, hasResults, shape, isExpanded, resultIsLink, onResultClick, parentId }, cancelRef) {
    let categories = useMemo(() => results && Object.keys(results).filter(category => results[category].length > 0), [results])
    let DOMId = parentId + '-results'
    if (shape === 'object') {
        return (
            <div id = {DOMId} className = {'absolute top-0 left-0 w-full h-full transition-[opacity] duration-main bg-base-main/90 rounded-base overflow-hidden p-base md:p-lg z-20 ' + (hasResults && isExpanded ? 'opacity-[100]' : 'opacity-[0] pointer-events-none')}>
                <div ref = {cancelRef} id = {DOMId + '-items'} className = 'w-full max-h-full flex flex-col gap-sm p-base bg-primary-main rounded-base overflow-auto no-scrollbar'>
                    <Map items = {categories} callback = {(category, categoryIndex) => {
                        let categoryId = DOMId + '-' + category; return (
                        <React.Fragment key = {categoryIndex}>
                            <div id = {categoryId + '-items'} className = 'w-full h-min'>
                                <Map items = {results[category]} callback = {(result, resultIndex) => {
                                    let resultId = DOMId + '-result' + resultIndex; return (
                                    <Result key = {resultIndex} index = {resultIndex} item = {result} category = {category} isLink = {resultIsLink} onClick = {onResultClick} parentId = {resultId}/>
                                )}}/>
                            </div>
                            <Conditional value = {categoryIndex !== categories.length - 1}>
                                <div className = 'border-t-thin border-divider-main'/>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </div>
            </div>
        )
    }
    else if (shape === 'array') {
        return (
            <div id = {DOMId} className = {'absolute top-0 left-0 w-full h-full transition-[opacity] duration-main bg-base-main/90 rounded-base overflow-hidden p-base md:p-lg z-20 ' + (hasResults && isExpanded ? 'opacity-[100]' : 'opacity-[0] pointer-events-none')}>
            {hasResults && 
                <div ref = {cancelRef} id = {DOMId + '-items'} className = 'w-full max-h-full flex flex-col gap-sm p-base bg-primary-main rounded-base overflow-auto no-scrollbar'>
                    <Map items = {results} callback = {(result, index) => {
                        let resultId = DOMId + '-result' + index; return (
                        <Result key = {index} index = {index} item = {result.item} category = {result.category} isLink = {resultIsLink} onClick = {onResultClick} parentId = {resultId}/>
                    )}}/>
                </div>}
            </div>
        )
    }
}, (b, a) => b.hasResults === a.hasResults && b.shape === a.shape && b.isExpanded === a.isExpanded && b.resultIsLink === a.resultIsLink && _.isEqual(b.results, a.results)))

const Result = memo(function Result({ category, item, onClick, isLink, parentId }) {
    let [isFavorite, Favorite] = useFavorite(category, item)
    let title = useMemo(() => {
        let DOMId = parentId + '-title'
        return (
            <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-primary'>
                {item.name}
            </Text>
        )
        // if (category === 'competitors' || category === 'competitions') {
        //     return (
        //         <>
        //             <Conditional value = {item.picture}>
        //                 <Image id = {DOMId + '-image'} external path = {item.picture} classes = 'h-4 w-4'/>
        //             </Conditional>
        //             <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-primary'>
        //                 {item.name}
        //             </Text>
        //         </>
        //     )
        // }
        // else if (category === 'events') {
        //     if (item.is_outright) {
        //         return (
        //             <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-primary'>
        //                 {item.name}
        //             </Text>
        //         )
        //     }
        //     else {
        //         return (
        //             <>
        //                 <div id = {DOMId + '-competitor0'} className = 'flex items-center gap-xs overflow-hidden'>
        //                     <Conditional value = {item.competitors[0].picture}>
        //                         <Image id = {DOMId + '-competitor0-image'} external path = {item.competitors[0].picture} classes = 'h-4 w-4'/>
        //                     </Conditional>
        //                     <Text id = {DOMId + '-competitor0-name'} preset = 'body' classes = 'text-text-primary'>
        //                         {item.competitors[0].name}
        //                     </Text>
        //                 </div>
        //                 <Text id = {DOMId + '-competitors-separator'} preset = 'body' classes = 'text-text-primary'>
        //                     {item.name.includes('@') ? '@' : 'v'}
        //                 </Text>
        //                 <div id = {DOMId + '-competitor1'} className = 'flex items-center gap-xs overflow-hidden'>
        //                     <Conditional value = {item.competitors[1].picture}>
        //                         <Image id = {DOMId + '-competitor1-image'} external path = {item.competitors[1].picture} classes = 'h-4 w-4'/>
        //                     </Conditional>
        //                     <Text id = {DOMId + '-competitor1-name'} preset = 'body' classes = 'text-text-primary'>
        //                         {item.competitors[1].name}
        //                     </Text>
        //                 </div>
        //             </>
        //         )
        //     }
        // }
        // else if (category === 'users') {
        //     return (
        //         <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-primary'>
        //             {item.display_name}
        //         </Text>
        //     )
        // }
    }, [item, category])

    let DOMId = parentId
    if (isLink) {
        return (
            <Link id = {DOMId} to = {category === 'users' ? '/users?id=' + item.id : '/info?category=' + category + '&id=' + item.id} className = 'group/result w-full flex items-center gap-tiny' onClick = {() => onClick(category, item)}>
                {title}
                <Conditional value = {category !== 'events' && category !== 'users'}>
                    <Favorite isFavorite = {isFavorite} category = {category} canEdit = {false} item = {item} classes = 'h-4 w-4' parentId = {DOMId}/>
                </Conditional>
            </Link>
            
        )
    }
    return (
        <div id = {DOMId} className = 'group/result w-full flex items-center gap-tiny cursor-pointer' onClick = {() => onClick(category, item)}>
            {title}
            <Conditional value = {category !== 'events' && category !== 'users'}>
                <Favorite isFavorite = {isFavorite} category = {category} canEdit = {false} item = {item} classes = 'h-4 w-4' parentId = {DOMId}/>
            </Conditional>
        </div>
    )
}, (b, a) => b.category === a.category && b.isLink === a.isLink && _.isEqual(b.item, a.item))

export default SearchWithResults