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
import Image from './image'
import toDate from '../lib/util/toDate'
import { CircleFill } from 'react-bootstrap-icons'
import now from '../lib/util/now'

const SearchWithResults = memo(forwardRef(function SearchWithResults({ searchConfig, onResultClick, closeOnClick = false, preset = 'main', autoFocus = false, showFavorites = false, classes, container, parentId }, ref) {
    let DOMId = parentId + '-search'
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

    return (
        <div ref = {ref} id = {DOMId} className = {'relative flex flex-col rounded-main' + (classes ? ' ' + classes : '')}>
            <SearchBar {...search} onFocus = {onFocus} autoFocus = {autoFocus} preset = {preset} parentId = {DOMId}/>
            {containerElement && isExpanded && createPortal(<Results ref = {cancelRef} results = {search.results} hasResults = {search.hasResults} shape = {resultsShape} isExpanded = {isExpanded} onResultClick = {(category, result) => onClick(category, result)} resultIsLink = {!onResultClick} showFavorites = {showFavorites} parentId = {DOMId}/>, containerElement)}
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
}), (b, a) => b.classes === a.classes && b.container === a.container && b.autoFocus === a.autoFocus && b.showFavorites === a.showFavorites && _.isEqual(JSON.stringify(b.searchConfig), JSON.stringify(a.searchConfig)))

const Results = memo(forwardRef(function Results({ results, hasResults, shape, isExpanded, resultIsLink, showFavorites, onResultClick, parentId }, cancelRef) {
    let DOMId = parentId + '-results'
    let categories = useMemo(() => results && Object.keys(results).filter(category => results[category].length > 0), [results])
    
    if (shape === 'object') {
        return (
            <div id = {DOMId} className = {'absolute top-0 left-0  transition-[opacity] duration-main w-full h-full p-base md:p-lg bg-base-main/70 rounded-base z-20 ' + (hasResults && isExpanded ? 'opacity-[100]' : 'opacity-[0] pointer-events-none')}>
                <div ref = {cancelRef} id = {DOMId + '-items'} className = 'w-full h-full flex flex-col gap-sm p-base bg-base-highlight rounded-base overflow-auto no-scrollbar shadow-lg'>
                    <Map items = {categories} callback = {(category, categoryIndex) => {
                        let categoryId = DOMId + '-' + category; return (
                        <React.Fragment key = {categoryIndex}>
                            <div id = {categoryId + '-items'} className = 'w-full h-min'>
                                <Map items = {results[category]} callback = {(result, resultIndex) => {
                                    let resultId = DOMId + '-result' + resultIndex; return (
                                    <Result key = {resultIndex} index = {resultIndex} item = {result} category = {category} isLink = {resultIsLink} showFavorites = {showFavorites} onClick = {onResultClick} parentId = {resultId}/>
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
            <div id = {DOMId} className = {'absolute top-0 left-0 transition-[opacity] duration-main w-full h-full p-base md:p-lg bg-base-main/70 rounded-base z-20 ' + (hasResults && isExpanded ? 'opacity-[100]' : 'opacity-[0] pointer-events-none')}>
            {hasResults && 
                <div ref = {cancelRef} id = {DOMId + '-items'} className = 'w-full h-full flex flex-col gap-base p-base bg-base-highlight rounded-base overflow-auto no-scrollbar shadow-lg'>
                    <Map items = {results} callback = {(result, index) => {
                        let resultId = DOMId + '-result' + index; return (
                        <Result key = {index} index = {index} item = {result.item} category = {result.category} isLink = {resultIsLink} showFavorites = {showFavorites} onClick = {onResultClick} parentId = {resultId}/>
                    )}}/>
                </div>}
            </div>
        )
    }
}, (b, a) => b.hasResults === a.hasResults && b.shape === a.shape && b.isExpanded === a.isExpanded && b.resultIsLink === a.resultIsLink && b.showFavorites === a.showFavorites && _.isEqual(b.results, a.results)))

const Result = memo(function Result({ category, item, onClick, isLink, showFavorites, parentId }) {
    let DOMId = parentId
    let [isFavorite, Favorite] = useFavorite(category, item)
    let title = useMemo(() => {
        let DOMId = parentId + '-title'
        if (category === 'competitors') {
            return (
                <>
                    <div id = {DOMId + '-image'} className = 'w-8 h-8 flex justify-center items-center bg-white border-base border-primary-main rounded-full'>
                        <Conditional value = {item.picture}>
                            <Image id = {DOMId + '-image-image'} external path = {item.picture} classes = 'w-inscribed aspect-square'/>
                        </Conditional>
                        <Conditional value = {!item.picture}>
                            <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted p-base text-center'>
                                {item.name.substr(0, 1)}
                            </Text>
                        </Conditional>
                    </div>
                    <Text id = {DOMId + '-name-name'} preset = 'body' classes = 'text-text-highlight'>
                        {item.name}
                    </Text>
                </>
            )
        } else if (category === 'competitions') {
            return (
                <>
                    <div id = {DOMId + '-image'} className = 'w-8 h-8 flex justify-center items-center bg-white border-base border-primary-main rounded-full'>
                        <Conditional value = {item.picture}>
                            <Image id = {DOMId + '-image-image'} external path = {item.picture} classes = 'w-inscribed aspect-square'/>
                        </Conditional>
                        <Conditional value = {!item.picture}>
                            <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted p-base text-center'>
                                {item.name.substr(0, 1)}
                            </Text>
                        </Conditional>
                    </div>
                    <div id = {DOMId + '-name'} className = 'flex flex-col gap-2xs'>
                        <Text id = {DOMId + '-name-name'} preset = 'body' classes = 'text-text-highlight'>
                            {item.name}
                        </Text>
                        <Text id = {DOMId + '-name-subtitle'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                            {item.sport.name}&nbsp;•&nbsp;{item.country.name}
                        </Text>
                    </div>
                </>
            )
        }
        else if (category === 'events') {
            if (item.is_outright) {
                return (
                    <div id = {DOMId + '-info'} className = 'flex items-center gap-2xs'>
                        <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-highlight'>
                            {item.name}
                        </Text>
                        <Conditional value = {now() > item.start_time}>
                            <CircleFill className = 'w-1 h-1 text-accent-main'/>
                        </Conditional>
                    </div>
                )
            }
            else {
                return (
                    <>
                        <div id = {DOMId + '-image'} className = 'w-8 h-8 flex justify-center items-center bg-white border-base border-primary-main rounded-full'>
                            <Conditional value = {item.competitors[0].picture}>
                                <Image id = {DOMId + '-image-image'} external path = {item.competitors[0].picture} classes = 'w-inscribed aspect-square'/>
                            </Conditional>
                            <Conditional value = {!item.competitors[0].picture}>
                                <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted p-base text-center'>
                                    {item.competitors[0].name.substr(0, 1)}
                                </Text>
                            </Conditional>
                        </div>
                        <div id = {DOMId + '-info'} className = 'flex flex-col gap-2xs overflow-hidden'>
                            <div id = {DOMId + '-info-top-bar'} className = 'flex items-center gap-2xs'>
                                <Text id = {DOMId + '-info-competition'} preset = 'subtitle' classes = 'text-text-highlight/muted whitespace-nowrap'>
                                    {item.competition.name}
                                </Text>
                                <Conditional value = {now() > item.start_time}>
                                    <CircleFill className = 'w-1 h-1 text-accent-main'/>
                                </Conditional>
                            </div>
                            <div id = {DOMId + '-info-name'} className = 'group/info w-full flex items-center'>
                                <Text id = {DOMId + '-info-competitor0-name'} preset = 'body' classes = 'text-text-highlight whitespace-nowrap overflow-hidden text-ellipsis'>
                                    {item.competitors[0].name}
                                </Text>
                                <Text id = {DOMId + '-info-competitors-separator'} preset = 'body' classes = 'text-text-highlight w-min flex'>
                                    &nbsp;{item.name.includes('@') ? '@' : 'v'}&nbsp;
                                </Text>
                                <Text id = {DOMId + '-info-competitor1-name-name'} preset = 'body' classes = 'text-text-highlight whitespace-nowrap overflow-hidden text-ellipsis'>
                                    {item.competitors[1].name}
                                </Text>
                            </div>
                            <Text id = {DOMId + '-info-date'} preset = 'subtitle' classes = 'text-text-highlight/muted whitespace-nowrap'>
                                {toDate(item.start_time)}
                            </Text>
                        </div>
                        <div id = {DOMId + '-image'} className = 'w-8 h-8 flex justify-center items-center bg-white border-base border-primary-main rounded-full'>
                            <Conditional value = {item.competitors[1].picture}>
                                <Image id = {DOMId + '-image-image'} external path = {item.competitors[1].picture} classes = 'w-inscribed aspect-square'/>
                            </Conditional>
                            <Conditional value = {!item.competitors[1].picture}>
                                <Text id = {DOMId + '-image-text'} preset = 'body' classes = 'text-black/muted p-base text-center'>
                                    {item.competitors[1].name.substr(0, 1)}
                                </Text>
                            </Conditional>
                        </div>
                    </>
                )
            }
        }
        else if (category === 'users') {
            return (
                <>
                    <Conditional value = {item.picture}>
                        <Image id = {DOMId + '-image-image'} external path = {item.picture} classes = 'w-8 h-8 border-base border-primary-main rounded-full'/>
                    </Conditional>
                    <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-highlight'>
                        {item.display_name}
                    </Text>
                </>
            )
        }
        return (
            <Text id = {DOMId + '-name'} preset = 'body' classes = 'text-text-highlight'>
                {item.name}
            </Text>
        )
    }, [item, category])

    if (isLink) {
        return (
            <Link id = {DOMId} to = {category === 'users' ? '/user?id=' + item.id : '/info?category=' + category + '&id=' + item.id} className = 'group/result w-full flex items-center gap-xs' onClick = {() => onClick(category, item)}>
                {title}
                <Conditional value = {showFavorites && category !== 'events' && category !== 'users'}>
                    <Favorite isFavorite = {isFavorite} category = {category} canEdit = {false} item = {item} classes = '!text-lg' parentId = {DOMId}/>
                </Conditional>
            </Link>
            
        )
    }
    return (
        <div id = {DOMId} className = 'group/result w-full flex items-center gap-xs cursor-pointer' onClick = {() => onClick(category, item)}>
            {title}
            <Conditional value = {showFavorites && category !== 'events' && category !== 'users'}>
                <Favorite isFavorite = {isFavorite} category = {category} canEdit = {false} item = {item} iconClasses = '!text-lg' parentId = {DOMId}/>
            </Conditional>
        </div>
    )
}, (b, a) => b.category === a.category && b.isLink === a.isLink && b.showFavorites === a.showFavorites && _.isEqual(b.item, a.item))

export default SearchWithResults