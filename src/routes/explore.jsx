import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { Icon24Hours, IconTrophyFilled, IconShirtSport, IconStarFilled, IconAlphabetLatin, IconCalendar, IconCircleFilled } from '@tabler/icons-react'
import { useWindowContext } from '../contexts/window'
import { ExploreProvider as Provider, useExploreContext } from '../contexts/explore'
import { useSearch } from '../hooks/useSearch'
import { useDatabase } from '../hooks/useDatabase'
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
    const { currentUser, data } = useRootContext()
    const { input, filters, setFilter, setParams, onInputChange, results } = useSearch()
    const context = { input, onInputChange, results, filters, setFilter }

    useEffect(() => {
        if (data) {
            setParams({
                filters: {
                    favorites: {
                        fn: (a) => a.filter(result => { return result.category === 'events' ? (currentUser?.favorites?.competitors?.some(favoriteCompetitor => result.item.competitors.some(eventCompetitor => eventCompetitor.id === favoriteCompetitor.id)) ||currentUser?.favorites?.competitions?.some(favoriteCompetition => result.item.competition.id === favoriteCompetition.id) ) : currentUser?.favorites[result.category]?.some(favorite => favorite.id === result.item.id) })
                    },
                    upcoming_events: {
                        fn: (a) => a.filter(r => r.category === 'events' && r.item.start_time < (now() + 60*60*24*3)),
                        turnsOff: ['competitors', 'competitions', 'events', 'live_events']
                    },
                    live_events: {
                        fn: (a) => a.filter(r => r.category === 'events' && r.item.start_time < now()),
                        turnsOff: ['competitors', 'competitions', 'events', 'upcoming_events']
                    },
                    competitions: {
                        fn: (a) => a.filter(r => r.category === 'competitions'),
                        turnsOff: ['competitors', 'events', 'upcoming_events', 'live_events']
                    },
                    competitors: {
                        fn: (a) => a.filter(r => r.category === 'competitors'),
                        turnsOff: ['competitions', 'events', 'upcoming_events', 'live_events']
                    },
                    events: {
                        fn: (a) => a.filter(r => r.category === 'events'),
                        turnsOff: ['competitions', 'competitors', 'upcoming_events', 'live_events']
                    },
                    alphabetical: {
                        fn: (a) => a.sort((a, b) => a.item.name.localeCompare(b.item.name))
                    },
                },
                limit: 100,
                categories: ['events', 'competitions', 'competitors', 'sports'],
                spaces: data,
                keys: { events: ['name', 'competition.name', 'competitors.name', 'sport.name'], competitions: ['name', 'sport.name', 'competitors.name'], competitors: ['name', 'competitions.name', 'sport.name'], sports: ['name', 'competitions.name'] },
                minimumLength: 1,
                singleArray: true
            })
        }
    }, [data])

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'explore-page' className = 'w-full h-full flex flex-col gap-smaller'>
                    <Helmet><title>Explore | Betsy</title></Helmet>
                    <Search/>
                    <Results/>
                </div>
            </Page>
        </Provider>
    )
}

function Search() {
    const { sm } = useWindowContext()
    const { input, onInputChange, filters, setFilter } = useExploreContext()

    const filterInfo = {
        alphabetical: {
            title: 'Sort Alphabetically',
            icon: () => <IconAlphabetLatin size = {sm ? 20 : 24} className = 'text-reverse-0 dark:text-base-0 opacity-main'/>
        },
        events: {
            title: 'Events',
            icon: () => <IconCalendar size = {sm ? 20 : 24} className = 'text-reverse-0 dark:text-base-0 opacity-main'/>
        },
        competitions: {
            title: 'Competitions',
            icon: () => <IconTrophyFilled size = {sm ? 20 : 24} className = 'text-reverse-0 dark:text-base-0 opacity-main'/>
        },
        competitors: {
            title: 'Competitors',
            icon: () => <IconShirtSport size = {sm ? 20 : 24} className = 'text-reverse-0 dark:text-base-0 opacity-main'/>
        },
        upcoming_events: {
            title: 'Upcoming Events',
            icon: () => <Icon24Hours size = {sm ? 20 : 24} className = 'text-reverse-0 dark:text-base-0 opacity-main'/>
        },
        live_events: {
            title: 'Live Events',
            icon: () => <IconCircleFilled size = {sm ? 20 : 24} className = 'text-live-0 opacity-main'/>
        },
        favorites: {
            title: 'Favorites',
            icon: () => <IconStarFilled size = {sm ? 20 : 24} className = 'text-reverse-0 dark:text-base-0 opacity-main'/>
        },
    }
    return (
        <div id = 'explore-page-search-container' className = 'relative flex flex-col md:flex-row gap-small md:gap-0'>
            <Input id = 'explore-search-input' preset = 'search' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = {'Explore...'} autoComplete = 'off'/>
            <div id = 'explore-page-search-filters' className = 'relative md:absolute top-0 right-0 h-full flex items-center gap-tiny md:gap-small'>
                {filters && Object.keys(filters)?.map((filter, index) => {
                    let id = 'explore-page-search-filter-' + filter + '-'
                    const Icon = () => filterInfo[filter].icon()
                    return (
                        <div key = {index} id = {id + 'container'} title = {filterInfo[filter].title} className = {'flex items-center justify-center h-8 md:h-full aspect-square rounded-lg bg-reverse-0 dark:bg-base-0 ' + (filters[filter] === true ? '!bg-opacity-[20%]' : '!bg-opacity-faint') + ' hover:!bg-opacity-[20%] cursor-pointer'} onClick = {() => setFilter(filter, !filters[filter])}>
                            <Icon/>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function Results() {
    const { addToFavorites, removeFromFavorites } = useDatabase()
    const { currentUser } = useRootContext()
    const { input, filters, results } = useExploreContext()
    return (
        <div id = 'explore-search-results' className = 'transition-all duration-main w-full h-full flex flex-col gap-smaller no-scrollbar overflow-scroll'>
            {results.length > 0 && results.map((result, resultIndex) => {
                if (input !== '' || (filters?.upcoming_events || filters?.live_events || filters?.favorites)) {
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
            case 'sports':
                return (
                    <Sport/>
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
        function Sport() {
            let id = 'explore-search-sport-' + _.snakeCase(result?.name) + '-'
            return (
                <div id = {id + 'container'} className = 'group transition-all duration-main relative w-min h-min flex flex-col' {...extras}>
                    <div id = {id + 'name-container'} className = ' flex flex-row items-baseline gap-small'>
                        <Favorite id = {id}/>
                        <Link to = {'/sport?id=' + result?.id}>
                            <Text preset = 'explore-result' id = {id + 'name'} >
                                {result?.name}
                            </Text>
                        </Link>
                    </div>
                </div>
            )
        }

        function Competitor() {
            let id = 'explore-search-competitor-' + _.snakeCase(result?.name) + '-'
            return (
                <div id = {id + 'container'} className = 'group transition-all duration-main w-min h-min flex flex-col' {...extras}>
                    <Text id = {id + 'subtitle'} preset = 'explore-result-subtitle'>
                        {result?.sport.name}
                    </Text>
                    <div id = {id + 'name-container'} className = 'flex flex-row items-center gap-tiny'>
                        <Favorite id = {id}/>
                        <CompetitorComponent link image id = {id + 'name'} competitor = {result}/>
                    </div>
                </div>
            )
        }

        function Competition() {
            let id = 'explore-search-competition-' + _.snakeCase(result?.name) + '-'
            return (
                <div id = {id + 'container'} className = 'group transition-all duration-main relative w-min h-min flex flex-col' {...extras}>
                    <Text preset = 'explore-result-subtitle' id = {id + 'subtitle'}>
                        {result?.sport.name}
                    </Text>
                    <div id = {id + 'name-container'} className = ' flex flex-row items-baseline gap-small'>
                        <Favorite id = {id}/>
                        <Link to = {'/competition?id=' + result?.id}>
                            <Text preset = 'explore-result' id = {id + 'name'} >
                                {result?.name}
                            </Text>
                        </Link>
                        <Image external path = {result?.country?.picture} id = {id + 'image'} mode = 'cover' classes = ' h-4 w-6 rounded-sm'/>
                    </div>
                </div>
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
                                <IconCircleFilled size = {20} className = 'text-live-0'/>
                            </Conditional>
                        </div>
                    </Conditional>
                    <Conditional value = {!(result?.is_outright)}>
                        <div id = {id + 'competitors-container'} className = 'expore-result-event-result-text-competitor-name w-min h-min flex flex-row items-center gap-tiny'>
                            {result?.name?.replace(' @ ', 'SPLIT')?.replace(' v ', 'SPLIT').split('SPLIT')?.map((competitor, index) => {
                                return (
                                    <React.Fragment key = {index}>
                                        <CompetitorComponent id = {id + competitor} image competitor = {result?.competitors?.find(c => c.name === competitor)}/>
                                        <Conditional value = {index !== result?.competitors.length - 1}>
                                            <Text preset = 'competitor' id = {id + competitor + '-separator'} classes = '!text-opacity-main'>{result?.name.split(' ').find(w => w === '@' || w === 'v')}</Text>
                                        </Conditional>
                                    </React.Fragment>
                                )
                            })}
                            <Conditional value = {isLive}>
                                <IconCircleFilled size = {20} className = 'text-live-0'/>
                            </Conditional>
                        </div>
                    </Conditional>
                    <Text preset = 'explore-result-subtitle' id = {id + 'date'}>
                        {new Date(result?.start_time * 1000).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}).replace('at', '-')}
                    </Text>
                </Link>
            )
        }

        function Favorite({id}) {
            let isFavorite = currentUser.favorites[category].some(f => f.id === result?.id)
            return (
                <div id = {id + 'favorite'} className = 'cursor-pointer'>
                    <IconStarFilled size = {20} className = {'transition-all duration-main ' + (isFavorite ? 'text-favorite-0 opacity-100' : 'text-reverse-0 dark:text-base-0 opacity-main hover:opacity-100 hover:text-favorite-0')} onClick = {() => isFavorite ? removeFromFavorites(category, result) : addToFavorites(category, result)}/>
                </div>
            )
        }
    }
}