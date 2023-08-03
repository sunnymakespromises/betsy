import React, { memo, useMemo, useState } from 'react'
import { Balloon, CashStack, CheckLg, Front, HeartFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useUserContext } from '../contexts/user'
import { useDatabase } from '../hooks/useDatabase'
import { useCurrency } from '../hooks/useCurrency'
import Conditional from './conditional'
import Text from './text'
import Image from './image'
import toDate from '../lib/util/toDate'
import { IconLock } from '@tabler/icons-react'

const Profile = memo(function Profile({ user, isCurrentUser, classes, parentId }) {
    let DOMId = parentId + '-profile'
    if (user) {
        return (
            <div id = {DOMId} className = {'relative transition-colors duration-main flex w-full min-w-[20rem] bg-base-highlight rounded-base p-base gap-sm ' + (classes ? ' ' + classes : '') + (user.is_locked ? ' grayscale' : '')}>
                <Picture picture = {user.picture} parentId = {DOMId}/>
                <div id = {DOMId + '-info'} className = {'w-full h-min flex flex-col gap-xs'}>
                    <div id = {DOMId + '-name'} className = 'flex items-center gap-xs'>
                        <Info category = 'display_name' value = {user.display_name} classes = '!text-xl' parentId = {DOMId}/>
                        <Tag id = {user.id} parentId = {DOMId}/>
                        <Locked isLocked = {user.is_locked} parentId = {DOMId}/>
                    </div>
                    <Subtitle balances = {user.balances} date = {user.join_date} parentId = {DOMId}/>
                </div>
                <Actions isCurrentUser = {isCurrentUser} user = {user} parentId = {DOMId}/>
            </div>
        )
    }
}, (b, a) => b.isCurrentUser === a.isCurrentUser && b.classes === a.classes && _.isEqual(b.user, a.user))

const Subtitle = memo(function Subtitle({ balances, date, parentId }) {
    const { getAmount } = useCurrency()

    let DOMId = parentId + '-subtitle'
    return (
        <div id = {DOMId} className = 'w-full flex flex-col gap-xs'>
            <div id = {DOMId = '-balance'} className = 'flex items-center gap-xs'>
                <CashStack id = {DOMId + '-balance-icon'} className = 'w-4 h-4 text-primary-main'/>
                <Text id = {DOMId + '-balance-value'} preset = 'subtitle' classes = 'text-text-highlight whitespace-nowrap'>
                    {getAmount(balances[balances.length - 1].value)}
                </Text>
            </div>
            <div id = {DOMId + '-date'} className = 'flex items-center gap-xs'>
                <Balloon id = {DOMId + '-date-icon'} className = 'w-4 h-4 text-primary-main'/>
                <Text id = {DOMId + '-date-value'} preset = 'subtitle' classes = 'text-text-highlight whitespace-nowrap'>
                    {toDate(date, true)}
                </Text>
            </div>
        </div>
    )
}, (b, a) => b.date === a.date && _.isEqual(b.balances, a.balances))

const Tag = memo(function Tag({ id, parentId }) {
    let DOMId = parentId
    return (
        <Text id = {DOMId + '-id'} preset = 'subtitle' classes = 'p-2xs bg-primary-main text-text-primary rounded-base'>
            {'@' + id}
        </Text>
    )
})

const Info = memo(function Info({ category, value, classes, parentId }) {
    let DOMId = parentId + '-' + category
    return (
        <Text id = {DOMId + '-text'} preset = 'body' classes = {'text-text-highlight' + (classes ? ' ' + classes : '')}>
            {value}
        </Text>
    )
}, (b, a) => b.category === a.category && b.value === a.value && b.classes === a.classes)

const Picture = memo(function Picture({ picture, parentId }) {
    let DOMId = parentId + '-picture'
    return (
        <div id = {DOMId} className = {'relative flex flex-col justify-center items-center h-20 aspect-square'}>
            <Image external id = {DOMId + '-image'} path = {picture} classes = {'relative h-full aspect-square rounded-full border-base border-primary-main overflow-hidden z-10'} mode = 'cover'/>
        </div>
    )
}, (b, a) => b.picture === a.picture)

const Actions = memo(function Actions({ user, isCurrentUser, parentId }) {
    const { currentUser } = useUserContext()
    let DOMId = parentId + '-actions'
    return (
        <div id = {DOMId} className = 'flex flex-col w-4 gap-xs z-10'>
            <Copy id = {user.id} parentId = {DOMId}/>
            <Conditional value = {!isCurrentUser && user}>
                <Subscription user = {user} subscriptions = {currentUser.subscriptions} isCurrentUser = {isCurrentUser} parentId = {DOMId}/>
            </Conditional>
        </div>
    )
}, (b, a) => b.isCurrentUser === a.isCurrentUser && _.isEqual(b.user, a.user))

const Subscription = memo(function Subscription({ user, subscriptions, parentId }) {
    const { subscribe, unsubscribe } = useDatabase()
    const currentUserIsSubscribedToUser = useMemo(() => subscriptions && subscriptions.some(subscription => subscription.id === user.id), [subscriptions, user])

    let DOMId = parentId + '-subscription'
    return (
        <HeartFill id = {DOMId + '-icon'} className = {'transition-colors duration-main w-4 h-4 cursor-pointer ' + (currentUserIsSubscribedToUser ? 'text-primary-main' : 'text-text-highlight/killed hover:text-primary-main')} onClick = {() => onClick()}/>
    )

    async function onClick() {
        if (currentUserIsSubscribedToUser) {
            await unsubscribe(user.id)
        }
        else {
            await subscribe(user.id)
        }
    }
}, (b, a) => _.isEqual(b.user, a.user) && _.isEqual(b.subscriptions, a.subscriptions))

const Copy = memo(function Copy({ id, parentId }) {
    const [isClicked, setIsClicked] = useState()
    let DOMId = parentId + '-copy'
    if (!isClicked) {
        return  <Front id = {DOMId + '-icon'} className = {'transition-colors duration-main w-4 h-4 text-primary-main hover:text-primary-highlight cursor-pointer'} onClick = {() => onClick()}/>
    }
    else {
        return <CheckLg id = {DOMId + '-icon'} className = {'transition-colors duration-main w-4 h-4 text-primary-main hover:text-primary-highlight cursor-pointer'} onClick = {() => onClick()}/>
    }

    function onClick() {
        navigator.clipboard.writeText(process.env.REACT_APP_BASE_URL + '/user?id=' + id)
        setIsClicked(true)
        setTimeout(() => {
            setIsClicked(false)
        }, 1000)
    }
})

const Locked = memo(function Locked({ isLocked, parentId }) {
    let DOMId = parentId + '-locked'
    return ( isLocked &&
        <div id = {DOMId} className = {'group/locked relative w-3 h-3 flex items-center justify-center'}>
            <IconLock id = {DOMId + '-icon'} className = {'w-full h-full text-text-main'}/>
            <div id = {DOMId + '-tooltip'} className = 'absolute top-full transition-all duration-main w-20 mt-xs px-sm bg-base-main rounded-base overflow-hidden h-0 group-hover/locked:h-min group-hover/locked:py-sm pointer-events-none'>
                <Text id = {DOMId + '-tooltip-text'} preset = 'subtitle' classes = 'text-text-main/muted'>
                    This account is locked because its balance went under $0.
                </Text>
            </div>
        </div>
    )
})

export default Profile