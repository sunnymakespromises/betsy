import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useWindowContext } from '../contexts/window'
import { ExploreProvider as Provider, useExploreContext } from '../contexts/explore'
import { IconShirtSport, IconSoccerField, IconBallFootball, IconTrophy, IconUser } from '@tabler/icons-react'
import { useSearch } from '../hooks/useSearch'
import Text from '../components/text'
import Image from '../components/image'
import Page from '../components/page'
import Input from '../components/input'
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
                limits: { sports: 10, competitions: 30, events: 30, competitors: 30, users: 20 },
                categories: ['sports', 'competitions', 'events', 'competitors', 'users'],
                spaces: data,
                keys: { sports: ['name'], competitions: ['name', 'sport.name'], events: ['name', 'competition.name'], competitors: ['name', 'competitions.name'], users: ['username', 'display_name'] },
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
        competitors: <IconShirtSport size = {sm ? 36 : 44} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  group-hover:opacity-100 ' + (currentCategory === 'competitors' ? 'opacity-100' : 'opacity-main')}/>,
        users: <IconUser size = {sm ? 36 : 44} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  group-hover:opacity-100 ' + (currentCategory === 'users' ? 'opacity-100' : 'opacity-main')}/>
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
            case 'users':
                return (
                    <Link to = {'/user?id=' + result?.id} className = {'transition-all duration-main explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main'}>
                        <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/>
                        <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
                            <Text classes = {'explore-search-' + currentCategory + '-result-text-display_name !text-2xl md:!text-2xl'}>
                                {result?.display_name}
                            </Text>
                            <Text classes = {'explore-search-' + currentCategory + '-result-text-username !text-xl md:!text-lg !text-opacity-main -mt-tiny'}>
                                {'@' + result?.username}
                            </Text>
                        </div>
                    </Link>
                )
            case 'sports':
                return (
                    <Link to = {'/sport?id=' + result?.id} className = {'group explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small'}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <Text preset = 'explore-result' classes = {'transition-all duration-main explore-search-' + currentCategory + '-result-text-display_name'}>
                            {result?.name}
                        </Text>
                    </Link>
                )
            case 'competitions':
                return (
                    <Link to = {'/competition?id=' + result?.id} className = {'group explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center'}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
                            <Text preset = 'explore-result' classes = {'explore-search-' + currentCategory + '-result-text-display_name'}>
                                {result?.name}
                            </Text>
                        </div>
                    </Link>
                )
            case 'competitors':
                return (
                    <Link to = {'/competitors?id=' + result?.id} className = {'group explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small'}>
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
                    <Link to = {'/events?id=' + result?.id} className = {'group transition-all duration-main explore-search-' + currentCategory + '-result-container w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main'}>
                        {/* <Image external path = {result?.picture} classes = {'explore-search-' + currentCategory + '-result-image h-10 md:h-10 aspect-square rounded-full'}/> */}
                        <div className = {'explore-search-' + currentCategory + '-result-text-container flex flex-col'}>
                            <Text preset = 'explore-result' classes = {'explore-search-' + currentCategory + '-result-text-display_name'}>
                                {result?.name}
                            </Text>
                        </div>
                    </Link>
                )
            default:
                return (
                    <></>
                )
        }
    }
}