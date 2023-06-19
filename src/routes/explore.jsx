import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useWindowContext } from '../contexts/window'
import { ExploreProvider as Provider, useExploreContext } from '../contexts/explore'
import { IconShirtSport, IconSoccerField, IconBallFootball, IconTrophy, IconClockFilled } from '@tabler/icons-react'
import { useSearch } from '../hooks/useSearch'
import Text from '../components/text'
import Image from '../components/image'
import Page from '../components/page'
import Input from '../components/input'
import Competitor from '../components/competitor'
import Conditional from '../components/conditional'
import { useRootContext } from '../contexts/root'

export default function Explore() {
    const { searchParams } = useWindowContext()
    const { data } = useRootContext()
    const [currentCategory, setCurrentCategory] = useState()
    const { input, setParams, onInputChange, results } = useSearch()
    const context = { results, currentCategory, input }

    useEffect(() => {
        if (searchParams.get('category')) {
            setCurrentCategory(searchParams.get('category'))
        }
        else {
            setCurrentCategory('sports')
        }
    }, [searchParams])

    useEffect(() => {
        if (data) {
            setParams({
                filters: {},
                limits: { sports: 10, competitions: 30, events: 30, competitors: 30 },
                categories: ['sports', 'competitions', 'events', 'competitors'],
                spaces: data,
                keys: { sports: ['name'], competitions: ['name', 'sport.name'], events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'] },
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
                    <div id = 'explore-search-results' className = {'transition-all duration-main w-full h-full flex flex-col rounded-main backdrop-blur-main overflow-hidden gap-smaller'}>
                        <Categories/>
                        <Results results = {results[currentCategory]}/>
                    </div>
                </div>
            </Page>
        </Provider>
    )
}

function Categories() {
    const { sm, searchParams, setSearchParams } = useWindowContext()
    const { currentCategory } = useExploreContext()
    const icons = { 
        sports: <IconBallFootball size = {sm ? 36 : 44} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  group-hover:opacity-100 ' + (currentCategory === 'sports' ? 'opacity-100' : 'opacity-main')}/>,
        competitions: <IconTrophy size = {sm ? 36 : 44} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  group-hover:opacity-100 ' + (currentCategory === 'competitions' ? 'opacity-100' : 'opacity-main')}/>,
        events: <IconSoccerField size = {sm ? 36 : 44} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  group-hover:opacity-100 ' + (currentCategory === 'events' ? 'opacity-100' : 'opacity-main')}/>,
        competitors: <IconShirtSport size = {sm ? 36 : 44} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  group-hover:opacity-100 ' + (currentCategory === 'competitors' ? 'opacity-100' : 'opacity-main')}/>
    }
    return (
        <div id = 'explore-search-categories' className = 'flex w-full h-min'>
            {Object.keys(icons).map((category, index) => {
                return (
                    <div key = {index} className = {'group explore-search-category-container w-full h-full flex justify-center cursor-pointer px-tiny pt-tiny'} onClick = {() => onChangeCategory(category)} >
                        {icons[category]}
                    </div>
                )
            })}
        </div>
    )

    function onChangeCategory(category) {
        setSearchParams({...Object.fromEntries([...searchParams]), category: category})
    }
}

function Results({results}) {
    const { sm } = useWindowContext()
    const { currentCategory } = useExploreContext()

    return (
        <div className = {'explore-search-' + currentCategory + '-results w-full h-full flex flex-col gap-smaller px-small pb-small overflow-scroll'}>
            {results?.map((result, index) => {
                return (
                    <Result key = {index} result = {result}/>
                )
            })}
        </div>
    )

    function Result({result}) {
        switch (currentCategory) {
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
                    <Link to = {'/sport?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main'}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <Text preset = 'explore-result' classes = {'transition-all duration-main explore-search-' + currentCategory + '-result-text-display_name'}>
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
                    <Link to = {'/competitors?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main'}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
                            <Text preset = 'explore-result' classes = {'explore-search-' + currentCategory + '-result-text-display_name'}>
                                {result?.name}
                            </Text>
                        </div>
                    </Link>
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

        function Competition() {
            return (
                <Link to = {'/competition?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + currentCategory + '-result-container relative w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main'}>
                    <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
                        <Text preset = 'explore-result' classes = {'explore-search-' + currentCategory + '-result-text-display_name'}>
                            {result?.name}
                        </Text>
                    </div>
                    <Image external path = {result?.country?.picture} mode = 'cover' classes = {'explore-search-' + currentCategory + '-result-image h-4 w-6 rounded-sm'}/>
                </Link>
            )
        }

        function Event() {
            return (
                <Link to = {'/events?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row gap-small origin-left hover:scale-main'}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
                            <Conditional value = {result?.is_outright}>
                                <div className = {'expore-result-' + currentCategory + '-result-text-name w-min h-min flex flex-row items-center gap-small'}>
                                    <Conditional value = {(result?.start_time * 1000) < Date.now()}>
                                        <IconClockFilled size = {sm ? 18 : 22} className = 'transition-all duration-main text-reverse-0 dark:text-base-0 opacity-90'/>
                                    </Conditional>
                                    <Text preset = 'competitor' classes = {'explore-search-' + currentCategory + '-result-text-name'}>
                                        {result?.name}
                                    </Text>
                                </div>
                            </Conditional>
                            <Conditional value = {!(result?.is_outright)}>
                                <div className = {'expore-result-' + currentCategory + '-result-text-competitor-name w-min h-min flex flex-row items-center gap-small'}>
                                    <Conditional value = {(result?.start_time * 1000) < Date.now()}>
                                        <IconClockFilled size = {sm ? 18 : 22} className = 'transition-all duration-main text-reverse-0 dark:text-base-0 opacity-90'/>
                                    </Conditional>
                                    {result?.competitors?.map((competitor, index) => {
                                        return (
                                            <React.Fragment key = {index}>
                                                <Competitor competitor = {competitor}/>
                                                <Conditional value = {index !== result?.competitors.length - 1}>
                                                    <Text preset = 'competitor' classes = '!text-opacity-main'>{result?.name.split(' ').find(w => w === '@' || w === 'v')}</Text>
                                                </Conditional>
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                            </Conditional>
                            <Text classes = 'whitespace-nowrap !text-base md:!text-base !text-opacity-main'>
                                {new Date(result?.start_time * 1000).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                            </Text>
                        </div>
                    </Link>
            )
        }
    }
}