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
import Conditional from '../components/conditional'
import { useRootContext } from '../contexts/root'

export default function Explore() {
    const { searchParams } = useWindowContext()
    const { data } = useRootContext()
    const currentCategory = searchParams.get('category') ? searchParams.get('category') : 'sports'
    const { setParams, input, onInputChange, results } = useSearch()
    const context = { results, currentCategory, input }

    useEffect(() => {
        if (data) {
            setParams({
                filters: {},
                limits: { sports: 3, competitions: 5, events: 8, competitors: 8, users: 10 },
                categories: ['sports', 'competitions', 'events', 'competitors', 'users'],
                spaces: data,
                keys: { sports: [], competitions: [], events: [], competitors: [], users: ['username', 'display_name'] },
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
                    <div id = 'explore-search-results' className = {'transition-all duration-main w-full flex flex-col rounded-main backdrop-blur-main px-small oerflow-hidden gap-smaller ' + (input !== '' ? 'py-small flex-1' : 'py-0 flex-0')}>
                        <Conditional value = {input !== ''}>
                            <Categories/>
                            <Results results = {results[currentCategory]}/>
                        </Conditional>
                    </div>
                </div>
            </Page>
        </Provider>
    )
}

function Categories() {
    const { sm, searchParams, setSearchParams } = useWindowContext()
    const { currentCategory, input } = useExploreContext()
    const icons = { 
        sports: <IconBallFootball size = {sm ? 36 : 40} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  hover:scale-main hover:opacity-100 ' + (currentCategory === 'sports' ? 'opacity-100' : 'opacity-main')}/>,
        competitions: <IconTrophy size = {sm ? 36 : 40} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  hover:scale-main hover:opacity-100 ' + (currentCategory === 'competitions' ? 'opacity-100' : 'opacity-main')}/>,
        events: <IconSoccerField size = {sm ? 36 : 40} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  hover:scale-main hover:opacity-100 ' + (currentCategory === 'events' ? 'opacity-100' : 'opacity-main')}/>,
        competitors: <IconShirtSport size = {sm ? 36 : 40} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  hover:scale-main hover:opacity-100 ' + (currentCategory === 'teams' ? 'opacity-100' : 'opacity-main')}/>,
        users: <IconUser size = {sm ? 36 : 40} className = {'transition-all duration-main text-reverse-0 dark:text-base-0  hover:scale-main hover:opacity-100 ' + (currentCategory === 'users' ? 'opacity-100' : 'opacity-main')}/>
    }
    return (
        <div id = 'explore-search-categories' className = {'flex overflow-hidden ' + (input !== '' ? 'w-full md:w-[40%]' : 'w-[0%]')}>
            {Object.keys(icons).map((category, index) => {
                return (
                    <div key = {index} className = 'explore-search-category-container w-full h-full flex justify-center md:justify-start cursor-pointer' onClick = {() => onChangeCategory(category)} >
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
        <div className = {'explore-search-' + currentCategory + '-results w-full flex flex-col gap-smaller'}>
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
            default:
                return (
                    <></>
                )
        }
    }
}