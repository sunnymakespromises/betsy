import { useParams } from 'react-router-dom'
import { useRootContext } from '../contexts/root'
import { useDatabase } from '../hooks/useDatabase'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import Image from '../components/image'
import Text from '../components/text'
import Button from '../components/button'
import calculateWallet from '../lib/calculateWallet'

export default function User() {
    const { user } = useRootContext()
    const [data, setData] = useState()
    const { getUserBy, follow, unfollow } = useDatabase()
    const { username } = useParams()

    useEffect(() => {
        if (username) {
            getData()  
        }
    }, [username])

    if (data === false) {
        return (
            <div id = 'user-page' className = 'transition-all duration-main w-full h-full flex flex-col items-center'>
                <Text>
                    User not found.
                </Text>
            </div>
        )
    }
    return (
        <div id = 'user-page' className = 'transition-all duration-main w-full h-full flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-12'>
            <Helmet><title>{username} | betsy</title></Helmet>
            <div id = 'user-profile' className = 'transition-all duration-main flex flex-col items-center gap-2 md:gap-4 w-[40%] h-[40%] md:w-64 md:h-full'>
                <div id = 'profile-picture-container' className = 'relative flex flex-col items-center w-full aspect-square'>
                    <Image id = 'profile-picture' external = {data ? true : false} path = {data ? data.user.picture : 'images/placeholder.png'} classes = 'transition-all duration-main h-full aspect-square rounded-full shadow-main' mode = 'cover'/>
                </div>
                <Text id = 'profile-username' classes = {'!font-bold !text-3xl md:!text-4xl' + (data ? '' : ' w-full h-9 md:h-10')}>
                    {data ? data.user.username : ''}
                </Text>
                <div id = 'follows-container' className = 'w-full flex flex-row justify-between'>
                    <div id = {'followers-container'} className = 'flex flex-col items-center'>
                        <Text id = {'followers-text'} classes = '!font-medium !text-base md:!text-xl'>
                            followers
                        </Text>
                        <Text id = {'followers-value'} classes = '!font-extrabold !text-3xl md:!text-5xl'>
                            {data ? data.follows.followers.length : 0}
                        </Text>
                    </div>
                    <div id = {'following-container'} className = 'flex flex-col items-center'>
                        <Text id = {'following-text'} classes = '!font-medium !text-base md:!text-xl'>
                            following
                        </Text>
                        <Text id = {'following-value'} classes = '!font-extrabold !text-3xl md:!text-5xl'>
                            {data ? data.follows.following.length : 0}
                        </Text>
                    </div>
                </div>
                {user?.username !== username ?
                <Button classes = 'w-full !p-2 md:!p-4' onClick = {() => onFollow()}>
                    <Text preset = 'button' classes = '!text-lg md:!text-2xl'>
                        {data?.follows?.followers?.filter((follow) => follow.follower === user.id).length === 0 ? 'follow' : 'unfollow'}
                    </Text>
                </Button>
                :null}
            </div>
            <div id = 'user-data' className = 'transition-all duration-main flex flex-col md:flex-row gap-2 md:gap-4 w-full h-full'>
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
    )

    async function getData() {
        const fetchedUser = (await getUserBy('username', username))
        if (fetchedUser.status) {
            console.log(fetchedUser)
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