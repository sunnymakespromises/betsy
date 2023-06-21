import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useWindowContext } from '../contexts/window'
import { ExploreProvider as Provider, useExploreContext } from '../contexts/explore'
import { useSearch } from '../hooks/useSearch'
import Text from '../components/text'
import Image from '../components/image'
import Page from '../components/page'
import Input from '../components/input'
import { default as CompetitorComponent } from '../components/competitor'
import Conditional from '../components/conditional'
import { useRootContext } from '../contexts/root'

export default function Explore() {
    const { data } = useRootContext()
    const { input, setParams, onInputChange, results } = useSearch()
    const [sortedResults, setSortedResults] = useState(results)
    const context = { sortedResults }

    useEffect(() => {
        if (data) {
            setParams({
                filters: {},
                limits: { events: 30, competitions: 12, competitors: 32 },
                categories: ['events', 'competitions', 'competitors' ],
                spaces: data,
                keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitions: ['name', 'sport.name', 'competitors.name'], competitors: ['name', 'competitions.name', 'sport.name'] },
                emptyOnInitial: false
            })
        }
    }, [data])

    useEffect(() => {
        if (results) {
            let newSortedResults = []
            Object.keys(results).map(c => results[c].map(r => newSortedResults.push({ category: c, item: r })))
            setSortedResults(newSortedResults)
        }
    }, [results])

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'explore-page' className = 'w-full h-full flex flex-col gap-smaller'>
                    <Helmet><title>Users | Betsy</title></Helmet>
                    <Input id = 'explore-search-input' preset = 'search' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Search...'} autoComplete = 'off'/>
                    <Results/>
                </div>
            </Page>
        </Provider>
    )
}

function Results() {
    const { sortedResults } = useExploreContext()
    const { isDarkMode } = useWindowContext()
    return (
        <div className = {'transition-all duration-main explore-search-results w-full h-full flex flex-col gap-smaller overflow-scroll md:gradient-mask-b-0 hover:md:gradient-mask-b-90 md:opacity-more-visible md:hover:opacity-100'}>
            {sortedResults.length > 0 && sortedResults.map((result, resultIndex) => {
                return (
                    <React.Fragment key = {resultIndex}>
                        <div className = 'transition-all duration-main w-min h-min'>
                            <Result category = {result.category} result = {result.item}/>
                        </div>
                    </React.Fragment>
                )
            })}
        </div>
    )

    function Result({ category, result, ...extras }) {
        switch (category) {
            case 'competitions':
                return (
                    <Competition/>
                )
            case 'competitors':
                return (
                    <Competitor/>
                )
            case 'events':
                return (
                    <Event/>
                )
            default:
                return (
                    <></>
                )
        }

        function Competitor() {
            return (
                <Link to = {'/competitors?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + category + '-result-container w-min h-min flex flex-col'} {...extras}>
                    {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                    <Text preset = 'explore-result-subtitle'>
                        {result?.sport.name}
                    </Text>
                    <div className = {'explore-search-' + category + '-result-text-container flex flex-row'}>
                        <Text preset = 'explore-result' classes = {'explore-search-' + category + '-result-text-display_name'}>
                            {result?.name}
                        </Text>
                    </div>
                </Link>
            )
        }

        function Competition() {
            return (
                <Link to = {'/competition?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + category + '-result-container relative w-min h-min flex flex-col'} {...extras}>
                    <Text preset = 'explore-result-subtitle'>
                        {result?.sport.name}
                    </Text>
                    <div className = {'explore-search-' + category + '-result-text-container flex flex-row items-baseline gap-small'}>
                        <Text preset = 'explore-result' classes = {'explore-search-' + category + '-result-text-display_name'}>
                            {result?.name}
                        </Text>
                        <Image external path = {result?.country?.picture} mode = 'cover' classes = {'explore-search-' + category + '-result-image h-4 w-6 rounded-sm'}/>
                    </div>
                </Link>
            )
        }

        function Event() {
            const isLive = (result?.start_time * 1000) < Date.now()

            return (
                <Link to = {'/events?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + category + '-result-container w-min h-min flex flex-row'} {...extras}>
                    <div className = {'explore-search-' + category + '-result-text-container flex flex-col'}>
                        <Text preset = 'explore-result-subtitle'>
                            {result?.sport?.name + ' - ' + result?.competition?.name}
                        </Text>
                        <Conditional value = {result?.is_outright}>
                            <div className = {'expore-result-' + category + '-result-text-name w-min h-min flex flex-row items-center gap-tiny'}>
                                <Text preset = 'competitor' classes = {'explore-search-' + category + '-result-text-name'}>
                                    {result?.name}
                                </Text>
                                <Conditional value = {isLive}>
                                    <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/live.svg'} classes = 'h-3 ml-1 aspect-square'/>
                                </Conditional>
                            </div>
                        </Conditional>
                        <Conditional value = {!(result?.is_outright)}>
                            <div className = {'expore-result-' + category + '-result-text-competitor-name w-min h-min flex flex-row items-center gap-tiny'}>
                                {result?.name?.replace(' @ ', 'SPLIT')?.replace(' v ', 'SPLIT').split('SPLIT')?.map((competitor, index) => {
                                    return (
                                        <React.Fragment key = {index}>
                                            <CompetitorComponent competitor = {result?.competitors?.find(c => c.name === competitor)}/>
                                            <Conditional value = {index !== result?.competitors.length - 1}>
                                                <Text preset = 'competitor' classes = '!text-opacity-main !text-lg md:!text-lg !no-underline'>{result?.name.split(' ').find(w => w === '@' || w === 'v')}</Text>
                                            </Conditional>
                                        </React.Fragment>
                                    )
                                })}
                                <Conditional value = {isLive}>
                                    <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/live.svg'} classes = 'h-3 ml-1 aspect-square'/>
                                </Conditional>
                            </div>
                        </Conditional>
                        <Text preset = 'explore-result-subtitle'>
                            {new Date(result?.start_time * 1000).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace('at', '-')}
                        </Text>
                    </div>
                </Link>
            )
        }
    }
}