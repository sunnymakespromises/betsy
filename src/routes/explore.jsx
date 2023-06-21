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
import _ from 'lodash'
import now from '../lib/util/now'

export default function Explore() {
    const { data } = useRootContext()
    const { input, setParams, onInputChange, results } = useSearch()
    const context = { input, results }

    useEffect(() => {
        if (data) {
            setParams({
                filters: [{ name: 'Live Events', fn: (a) => a.filter(r => r.category === 'events' && r.item.start_time < now())}],
                limits: { events: 50, competitions: 50, competitors: 50 },
                categories: ['events', 'competitions', 'competitors' ],
                spaces: data,
                keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitions: ['name', 'sport.name', 'competitors.name'], competitors: ['name', 'competitions.name', 'sport.name'] },
                minimumLength: 3,
                singleArray: true
            })
        }
    }, [data])

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
    const { input, results } = useExploreContext()
    const { isDarkMode } = useWindowContext()
    return (
        <div id = 'explore-search-results' className = 'transition-all duration-main w-full h-full flex flex-col gap-smaller overflow-scroll md:gradient-mask-b-0 hover:md:gradient-mask-b-90 md:opacity-more-visible md:hover:opacity-100'>
            {results.length > 0 && results.map((result, resultIndex) => {
                if (input === '' ? result.category === 'events' : true) {
                    let id = 'explore-search-result-' + _.snakeCase(result?.name) + '-'
                    return (
                        <div key = {resultIndex} id = {id + 'container'} className = 'transition-all duration-main w-min h-min'>
                            <Result category = {result.category} result = {result.item}/>
                        </div>
                    )
                }
                return null
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
            let id = 'explore-search-competitor-' + _.snakeCase(result?.name) + '-'
            return (
                <Link to = {'/competitors?id=' + result?.id} id = {id + 'container'} className = 'group transition-all duration-main w-min h-min flex flex-col' {...extras}>
                    <Text id = {id + 'subtitle'} preset = 'explore-result-subtitle'>
                        {result?.sport.name}
                    </Text>
                    <div id = {id + 'name-container'} className = 'flex flex-row'>
                        <Conditional value = {result?.picture}>
                            <Image id = {id + 'image'} external path = {result?.picture} classes = {'h-6 md:h-6 aspect-square rounded-full'}/>
                        </Conditional>
                        <Text id = {id + 'name'}preset = 'explore-result'>
                            {result?.name}
                        </Text>
                    </div>
                </Link>
            )
        }

        function Competition() {
            let id = 'explore-search-competition-' + _.snakeCase(result?.name) + '-'
            return (
                <Link to = {'/competition?id=' + result?.id} id = {id + 'container'} className = 'group transition-all duration-main relative w-min h-min flex flex-col' {...extras}>
                    <Text preset = 'explore-result-subtitle' id = {id + 'subtitle'}>
                        {result?.sport.name}
                    </Text>
                    <div id = {id + 'name-container'} className = ' flex flex-row items-baseline gap-small'>
                        <Text preset = 'explore-result' id = {id + 'name'} >
                            {result?.name}
                        </Text>
                        <Image external path = {result?.country?.picture} id = {id + 'image'} mode = 'cover' classes = ' h-4 w-6 rounded-sm'/>
                    </div>
                </Link>
            )
        }

        function Event() {
            const isLive = result?.start_time < now()
            let id = 'explore-search-event-' + _.snakeCase(result?.name) + '-'
            return (
                <Link to = {'/events?id=' + result?.id} id = {id + 'container'} className = 'group transition-all duration-main w-min h-min flex flex-col' {...extras}>
                    <Text preset = 'explore-result-subtitle' id = {id + 'subtitle'}>
                        {result?.sport?.name + ' - ' + result?.competition?.name}
                    </Text>
                    <Conditional value = {result?.is_outright}>
                        <div id = {id + 'name-container'} className = 'w-min h-min flex flex-row items-center gap-tiny'>
                            <Text preset = 'competitor' id = {id + 'name'}>
                                {result?.name}
                            </Text>
                            <Conditional value = {isLive}>
                                <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/live.svg'} id = {id + 'is-live'} classes = 'h-3 ml-1 aspect-square'/>
                            </Conditional>
                        </div>
                    </Conditional>
                    <Conditional value = {!(result?.is_outright)}>
                        <div id = {id + 'competitors-container'} className = 'expore-result-event-result-text-competitor-name w-min h-min flex flex-row items-center gap-tiny'>
                            {result?.name?.replace(' @ ', 'SPLIT')?.replace(' v ', 'SPLIT').split('SPLIT')?.map((competitor, index) => {
                                return (
                                    <React.Fragment key = {index}>
                                        <CompetitorComponent id = {id + competitor} competitor = {result?.competitors?.find(c => c.name === competitor)}/>
                                        <Conditional value = {index !== result?.competitors.length - 1}>
                                            <Text preset = 'competitor' id = {id + competitor + '-separator'} classes = '!text-opacity-main !text-lg md:!text-lg !no-underline'>{result?.name.split(' ').find(w => w === '@' || w === 'v')}</Text>
                                        </Conditional>
                                    </React.Fragment>
                                )
                            })}
                            <Conditional value = {isLive}>
                                <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/live.svg'} id = {id + 'is-live'} classes = 'h-3 ml-1 aspect-square'/>
                            </Conditional>
                        </div>
                    </Conditional>
                    <Text preset = 'explore-result-subtitle' id = {id + 'date'}>
                        {new Date(result?.start_time * 1000).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace('at', '-')}
                    </Text>
                </Link>
            )
        }
    }
}