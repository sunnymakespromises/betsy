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
    const context = {  }

    useEffect(() => {
        if (data) {
            setParams({
                filters: {},
                limits: { sports: 10, competitions: 12, events: 30, competitors: 32 },
                categories: ['events', 'competitions', 'competitors', 'sports' ],
                spaces: data,
                keys: { sports: ['name'], competitions: ['name', 'sport.name', 'competitors.name'], events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'] },
                emptyOnInitial: false
            })
        }
    }, [data])

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'explore-page' className = 'w-full h-full flex flex-col gap-smaller'>
                    <Helmet><title>Users | Betsy</title></Helmet>
                    <Input id = 'explore-search-input' preset = 'search' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Search...'} autoComplete = 'off'/>
                    <Results results = {results}/>
                </div>
            </Page>
        </Provider>
    )
}

function Results({results}) {
    const { sm, isDarkMode } = useWindowContext()
    return (
        <div className = {'transition-all duration-main explore-search-results w-full h-full flex flex-col gap-smaller overflow-scroll md:gradient-mask-b-0 hover:md:gradient-mask-b-90 md:opacity-more-visible md:hover:opacity-100'}>
            {results && Object.keys(results)?.map((resultCategory, resultCategoryIndex) => {
                return (
                    results[resultCategory].map((result, resultIndex) => {
                        return (
                            <React.Fragment key = {resultIndex}>
                                <div className = 'transition-all duration-main w-min h-min'>
                                    <Result category = {resultCategory} result = {result}/>
                                </div>
                                {/* <div className = 'w-full border opacity-faint'/> */}
                            </React.Fragment>
                        )
                    })
                )
            })}
        </div>
    )

    function Result({ category, result, ...extras }) {
        switch (category) {
            // case 'users':
            //     return (
            //         <Link to = {'/user?id=' + result?.id} className = {'transition-all duration-main explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main'}>
            //             <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/>
            //             <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
            //                 <Text classes = {'explore-search-' + currentCategory + '-result-text-display_name !text-2xl md:!text-2xl'}>
            //                     {result?.display_name}
            //                 </Text>
            //                 <Text classes = {'explore-search-' + currentCategory + '-result-text-username !text-xl md:!text-lg !text-opacity-main -mt-tiny'}>
            //                     {'@' + result?.username}
            //                 </Text>
            //             </div>
            //         </Link>
            //     )
            case 'sports':
                return (
                    <Link to = {'/sport?id=' + result?.id} className = {'explore-search-' + category + '-result-container w-min h-min flex flex-row items-center gap-small'} {...extras}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <Text preset = 'explore-result' classes = {'explore-search-' + category + '-result-text-display_name'}>
                            {result?.name}
                        </Text>
                    </Link>
                )
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
                                {result?.competitors?.map((competitor, index) => {
                                    return (
                                        <React.Fragment key = {index}>
                                            <CompetitorComponent competitor = {competitor}/>
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