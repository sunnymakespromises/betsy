import React, { memo, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { HeartFill, PersonFill } from 'react-bootstrap-icons'
import { useUserContext } from '../contexts/user'
import { useDataContext } from '../contexts/data'
import { useCurrency } from '../hooks/useCurrency'
import Page from '../components/page'
import Text from '../components/text'
import Conditional from '../components/conditional'
import Map from '../components/map'
import Event from '../components/event'
import { MultiPanel } from '../components/panel'
import Slips from '../components/slips'

const Home = memo(function Home() {
    let DOMId = 'home'
    const { data } = useDataContext()
    const { currentUser } = useUserContext()
    const { getAmount } = useCurrency()
    let activeSlips = useMemo(() => currentUser.slips.filter(slip => slip.did_hit === null), [currentUser])
    let potentialEarnings = useMemo(() => {
        if (activeSlips.length > 0) {
            return getAmount('dollars', null, activeSlips.reduce((a, b) => a.potential_earnings + b.potential_earnings), false).string
        }
        return getAmount('dollars', null, 0, false).string
    }, [activeSlips])
    let panelsConfig = useMemo(() => { return [
        {
            category: 'div',
            divId: DOMId + '-column1',
            divClasses: 'w-full md:w-auto md:min-w-[36rem] flex flex-col gap-base md:gap-lg',
            children: [
                {
                    category: 'display',
                    children: 
                        currentUser && <div id = {DOMId + '-today'} className = 'w-full h-min flex flex-col gap-base p-base bg-base-highlight rounded-base'>
                            <div id = {DOMId + '-today-intro'} className = 'w-full h-min flex flex-wrap gap-y-xs'>
                                <Text id = {DOMId + '-today-intro0'} preset = 'title' classes = 'text-text-highlight'>
                                    Welcome back,&nbsp;
                                </Text>
                                <Link id = {DOMId + '-today-user-link'} to = '/user'>
                                    <Text id = {DOMId + '-today-user-displayname'} preset = 'title' classes = '!font-bold text-primary-main'>
                                        {currentUser.display_name}
                                    </Text>
                                </Link>
                                <Text id = {DOMId + '-today-intro1'} preset = 'title' classes = 'text-text-highlight'>
                                    ! You currently have&nbsp;
                                </Text>
                                <Text id = {DOMId + '-today-slips-number'} preset = 'title' classes = '!font-bold text-text-highlight'>
                                    {activeSlips.length}
                                </Text>
                                <Text id = {DOMId + '-today-intro2'} preset = 'title' classes = 'text-text-highlight'>
                                    &nbsp;active slips, potentially worth&nbsp;
                                </Text>
                                <Text id = {DOMId + '-today-slips-number'} preset = 'title' classes = '!font-bold text-text-highlight'>
                                    {potentialEarnings}
                                </Text>
                                <Text id = {DOMId + '-today-intro2'} preset = 'title' classes = 'text-text-highlight'>
                                    !
                                </Text>
                            </div>
                            <Slips compressedSlips = {activeSlips} isEditable = {false} parentId = {DOMId + '-active-slips'} />
                        </div>
                },
                {
                    category: 'panel',
                    key: 'favorite_events',
                    icon: HeartFill,
                    panelClasses: '',
                    parentId: DOMId + '-events',
                    children: 
                        <div id = {DOMId + '-events'} className = 'flex flex-col gap-lg'>
                            <Conditional value = {data?.recommendations.favorites?.length > 0}>
                                <Map items = {data?.recommendations.favorites} callback = {(event, index) => {
                                    let eventId = DOMId + '-event' + index; return (
                                    <Event key = {index} event = {event} events = {data.events} parentId = {eventId}/>
                                )}}/>
                            </Conditional>
                            <Conditional value = {data?.recommendations.favorites?.length < 1}>
                                <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                                    No events found.
                                </Text>
                            </Conditional>
                        </div>
                }
            ]
        },
        {
            category: 'div',
            divId: DOMId + '-column2',
            divClasses: 'grow flex flex-col gap-base md:gap-lg',
            children: [
                {
                    category: 'panel',
                    key: 'subscriptions_slips',
                    icon: PersonFill,
                    panelClasses: 'w-full',
                    parentId: DOMId + '-subscriptions',
                    children: 
                        <div id = {DOMId + '-subscriptions'} className = 'flex flex-col gap-lg'>
                            <Conditional value = {data?.recommendations?.subscriptions?.length > 0}>
                                <Slips compressedSlips = {data?.recommendations?.subscriptions} isEditable = {false} parentId = {DOMId + '-subscriptions'} />
                            </Conditional>
                            <Conditional value = {data?.recommendations?.subscriptions?.length < 1}>
                                <Text id = {DOMId + '-events-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                                    No slips from subscriptions found.
                                </Text>
                            </Conditional>
                        </div>
                }
            ]
        }
    ]}, [data])

    return (
        <Page canScroll DOMId = {DOMId}>
            <div id = {DOMId} className = 'relative w-full h-full flex flex-col md:flex-row gap-base md:gap-lg'>
                <Helmet><title>Dashboard • Betsy</title></Helmet>
                <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
            </div>
        </Page>
    )
})

export default Home