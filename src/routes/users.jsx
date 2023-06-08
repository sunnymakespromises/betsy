import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import { UsersProvider as Provider, useUsersContext } from '../contexts/users'
import { useRootContext } from '../contexts/root'
import { useDatabase } from '../hooks/useDatabase'
import { useAnimator } from '../hooks/useAnimator'
import User from '../components/user'

export default function Users() {
    const { currentUser } = useRootContext()
    let [searchParams, setSearchParams] = useSearchParams()
    const { getUserBy, follow, unfollow } = useDatabase()
    const [user, setUser] = useState()
    const username = searchParams.get('user')
    const loaded = useAnimator()
    const context = { user, username, onFollowButtonClick, onSubmitChanges }

    useEffect(() => {
        async function initialize() {
            setUser(await getUser()) 
        }

        if (username) { initialize() }
        else { setUser(false) }
    }, [username])

    return (
        <Provider value = {context}>
            <div id = 'users-page' className = {'relative transition-all duration-main w-full h-full flex flex-col items-center justify-center gap-4' + (loaded ? ' translate-x-0 opacity-1' : ' translate-x-[100%] opacity-0')}>
                <Helmet><title>{username ? username : 'users'} | betsy</title></Helmet>
                <User/>
            </div>
        </Provider>
    )

    async function getUser() {
        const fetchedUser = (await getUserBy('username', username))
        if (fetchedUser.status) {
            return fetchedUser.user
        }
        else {
            return false
        }
    }

    function onSubmitChanges(changes) {
        if (changes.username.didChange) {
            setSearchParams({user: changes.username.changedTo})
        }
    }

    async function onFollowButtonClick() {
        if (user) {
            if (user.follows.followers.filter((follow) => follow.follower === currentUser.id).length === 0) {
                if ((await follow(user.id)).status) { setUser(await getUser()) }
            }
            else {
                if ((await unfollow(user.id)).status) { setUser(await getUser()) }
            }
        }
    }
}