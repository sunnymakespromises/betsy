import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useRootContext } from '../contexts/root'
import { useDatabase } from '../hooks/useDatabase'
import { useEffect, useState } from 'react'
import Image from './image'
import Text from './text'
import Button from './button'
import calculateWallet from '../lib/calculateWallet'

export default function User() {
    const { user, navigate } = useRootContext()
    const [data, setData] = useState()
    const { getUserBy, follow, unfollow } = useDatabase()
    const { username } = useParams()

    useEffect(() => {
        if (username) {
            getData()  
        }
    }, [username])

    return (
        <div id = 'user-page' className = 'transition-all duration-main w-full h-full flex flex-col items-center gap-2 md:gap-8'>
            <Helmet><title>{username} | betsy</title></Helmet>
            <div id = 'user-navigation' className = 'w-full flex flex-row'>
                <Text classes = '!text-xl !cursor-pointer' onClick = {() => navigate('/users')}>
                    back
                </Text>
            </div>
            <div id = 'user-info' className = 'w-full h-full flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-12'>
                <div id = 'user-profile' className = {'transition-[opacity] duration-main flex flex-row items-start md:flex-col md:items-center gap-4 md:gap-4 w-full h-64 md:w-64 md:h-full origin-top ' + (data ? 'opacity-1' : 'opacity-0')}>
                    <div id = 'profile-picture-container' className = 'transition-all duration-main relative flex flex-col items-center aspect-square w-[40%] md:w-[80%]'>
                        <Image id = 'profile-picture' external path = {data ? data.user.picture : ''} classes = 'h-full aspect-square rounded-full shadow-main' mode = 'cover'/>
                    </div>
                    <div id = 'profile-text-container' className = 'w-[60%] md:w-full flex flex-col gap-2 md:gap-4'>
                        <Text id = 'profile-username' classes = 'text-ellipsis overflow-hidden !font-bold h-9 md:h-10 !text-3xl md:!text-4xl w-full'>
                            {data ? data.user.username : ''}
                        </Text>
                        <div id = 'profile-follows-container' className = 'w-full flex flex-col items-center gap-1 md:gap-2'>
                            <div id = 'profile-follows-text-container' className = 'w-full flex flex-row justify-between'>
                                <div id = {'followers-container'} className = 'flex flex-col items-center'>
                                    <Text id = {'followers-text'} classes = '!font-medium !text-base md:!text-xl'>
                                        followers
                                    </Text>
                                    <Text id = {'followers-value'} classes = '!font-extrabold h-9 md:h-12 !text-3xl md:!text-5xl'>
                                        {data ? data.follows.followers.length : ''}
                                    </Text>
                                </div>
                                <div id = {'following-container'} className = 'flex flex-col items-center'>
                                    <Text id = {'following-text'} classes = '!font-medium !text-base md:!text-xl'>
                                        following
                                    </Text>
                                    <Text id = {'following-value'} classes = '!font-extrabold h-9 md:h-12 !text-3xl md:!text-5xl'>
                                        {data ? data.follows.following.length : ''}
                                    </Text>
                                </div>
                            </div>
                            {user?.username !== username ?
                            <Button classes = 'h-11 md:h-16 !p-0 overflow-hidden !duration-slow w-full' onClick = {() => onFollow()}>
                                <Text preset = 'button' classes = '!text-lg md:!text-2xl'>
                                    {data ? data?.follows?.followers?.filter((follow) => follow.follower === user.id).length !== 0 ? 'unfollow' : 'follow' : '' }
                                </Text>
                            </Button>
                            :null}
                        </div>
                    </div>
                </div>
                <div id = 'user-data' className = 'transition-all duration-main flex flex-col md:flex-row gap-2 md:gap-4 md:w-min h-full w-full'>
                    <div id = 'user-wallet' className = 'w-full h-[55%] md:w-[55%] md:h-full flex flex-col gap-2 md:gap-4'>
                        <Text classes = '!text-4xl md:!text-6xl !font-extrabold'>
                            {'$' + (data ? calculateWallet(data.slips) : '0')}
                        </Text>
                        <div id = 'user-graph' className = 'w-full h-full bg-base-0 rounded-main shadow-main'>

                        </div>
                    </div>
                    <div id = 'user-slips' className = 'w-full h-[45%] md:w-[45%] md:h-full flex flex-col gap-2'>
                        
                    </div>
                </div>
            </div>
        </div>
    )

    async function getData() {
        const fetchedUser = (await getUserBy('username', username))
        if (fetchedUser.status) {
            setData(fetchedUser.data)
        }
        else {
            setData(false)
        }
    }

    async function onFollow() {
        if (data) {
            if (data.follows.followers.filter((follow) => follow.follower === user.id).length === 0) {
                if ((await follow(data.user.id)).status) { getData() }
            }
            else {
                if ((await unfollow(data.user.id)).status) { getData() }
            }
        }
    }
}