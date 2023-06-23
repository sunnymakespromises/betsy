import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { FaAngleLeft } from '@react-icons/all-files/fa/FaAngleLeft'
import Cropper from 'react-easy-crop'
import { useWindowContext } from '../contexts/window'
import { useRootContext } from '../contexts/root'
import { UserProvider, useUserContext } from '../contexts/user'
import { ProfileProvider, useProfileContext } from '../contexts/profile'
import { useLoading } from '../hooks/useLoading'
import { useStatuses } from '../hooks/useStatuses'
import { useInput } from '../hooks/useInput'
import { useCropper } from '../hooks/useCropper'
import { useDatabase } from '../hooks/useDatabase'
import Image from '../components/image'
import Text from '../components/text'
import Button from '../components/button'
import Input from '../components/input'
import Conditional from '../components/conditional'
import Page from '../components/page'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { Link } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'

export default function User() {
    const { searchParams } = useWindowContext()
    const { currentUser, data } = useRootContext()
    const [user, setUser] = useState()
    const [searchSpace, setSearchSpace] = useState()
    const { getUserBy } = useDatabase()
    const userId = searchParams.get('id')
    const isCurrentUser = currentUser?.id === userId
    const context = { user, setUser, isCurrentUser, getUser, searchSpace, setSearchSpace }

    useEffect(() => {
        async function initialize() {
            if (isCurrentUser) {
                setUser(currentUser)
            }
            else {
                setUser(await getUser()) 
            }
        }

        if (userId) { initialize() }
        else { setUser(false) }
    }, [userId, currentUser, data])

    return (
        <UserProvider value = {context}>
            <Page dim = {searchSpace}>
                <div id = 'user-page' className = 'w-full h-full flex flex-col items-center justify-center gap-smaller'>
                    <Helmet><title>{user?.username + ' | Betsy'}</title></Helmet>
                    <div id = 'user' className = 'relative w-full h-full flex flex-col items-center md:flex-row md:items-start gap-smaller md:gap-main'>
                        <Profile/>
                        <Slips/>
                        <Stats/>
                    </div>
                    <Conditional value = {searchSpace}>
                        <SubscriptionsModal/>
                    </Conditional>
                </div>
            </Page>
        </UserProvider>
    )

    async function getUser() {
        const fetchedUser = await getUserBy('id', userId)
        return fetchedUser.status ? fetchedUser.user : false
    }
}

function Profile() {
    const { user, isCurrentUser } = useUserContext()
    const [isEditing, setIsEditing] = useState()
    const [isLoading, execute] = useLoading()
    const [statuses, setStatus, clearAllStatuses] = useStatuses(['username', 'display_name', 'picture', 'bio'])
    const { input, clearInput, clearAllInput, onInputChange } = useInput(['username', 'display_name', 'picture', 'bio'])
    const context = { isEditing, setIsEditing, isLoading, execute, statuses, setStatus, clearAllStatuses, input, clearInput, clearAllInput, onInputChange }

    useEffect(() => {
        if (isCurrentUser && isEditing === false) {
            clearAllInput()
            clearAllStatuses()
        }
    }, [isEditing])

    return (
        <ProfileProvider value = {context}>
            <div id = 'user-profile' className = {'flex flex-col items-start md:items-center gap-small md:gap-small w-full md:w-96 md:h-full origin-top animate__animated animate__slideInUp'}>
                <DisplayName display_name = {user?.display_name}/>
                <div className = 'user-profile-info-container w-full flex flex-row gap-small'>
                    <Picture picture = {user?.picture}/>
                    <Subscriptions subscribers = {user?.subscribers} subscriptions = {user?.subscriptions}/>
                </div>
                <div id = 'user-profile-username-bio' className = 'w-full flex flex-col'>
                    <Username username = {user?.username}/>
                    <Bio bio = {user?.bio}/>
                </div>
            </div>
        </ProfileProvider>
    )    
}

function DisplayName({ display_name }) {
    const { navigate } = useWindowContext()
    const { isCurrentUser } = useUserContext()
    const { input, onInputChange, statuses, isLoading, isEditing } = useProfileContext()

    if (isEditing || isLoading) {
        return (
            <div id = 'user-profile-display_name-input-container' className = 'relative w-full flex flex-col items-center'>
                <div id = 'user-profile-display_name-input-input-container' className = 'w-full flex flex-row items-center'>
                    <FaAngleLeft id = 'user-back-button' onClick = {() => navigate(-1)} className = 'transition-all duration-main absolute top-[50%] left-0 w-8 h-8 -translate-y-[50%] cursor-pointer text-reverse-0 dark:text-base-0 hover:scale-main'/>
                    <Input id = 'user-profile-display_name-input' preset = 'profile' status = {statuses?.display_name} value = {input?.display_name} onChange = {(e) => onChange(e)} placeholder = {display_name} autoComplete = 'off'/>
                </div>
                <Conditional value = {statuses?.display_name?.message}>
                    <Text id = 'user-profile-display_name-input-error' preset = 'profile-error' classes = 'w-full text-center'>
                        {statuses?.display_name?.message}
                    </Text>
                </Conditional>
            </div>
        )
    }
    else {
        return (
            <div id = 'user-profile-display_name-container' className = 'relative w-full flex flex-row items-center'>
                <FaAngleLeft id = 'user-back-button' onClick = {() => navigate(-1)} className = 'transition-all duration-main absolute top-[50%] left-0 w-8 h-8 -translate-y-[50%] cursor-pointer text-reverse-0 dark:text-base-0 hover:scale-main'/>
                <Text id = 'user-profile-display_name' classes = 'text-ellipsis overflow-hidden text-center !font-black h-9 w-full'>
                    {display_name}
                </Text>
            </div>
        )
    }

    function onChange(event) {
        if (isCurrentUser) {
            onInputChange('display_name', event.target.value, 'text')
        }
    }
}

function Username({ username }) {
    const { isCurrentUser } = useUserContext()
    const { input, onInputChange, statuses, isLoading, isEditing } = useProfileContext()

    if (isEditing || isLoading) {
        return (
            <div id = 'user-profile-username-input-container' className = 'w-full flex flex-col items-center'>
                <div id = 'user-profile-username-input-input-container' className = 'w-full flex flex-row items-center'>
                    <Text id = 'user-profile-username-@' classes = '!font-bold !text-xl'>
                        @
                    </Text>
                    <Input id = 'user-profile-username-input' preset = 'profile' classes = '!font-bold !text-xl !text-left' status = {statuses?.username} value = {input?.username} onChange = {(e) => onChange(e)} placeholder = {username} autoComplete = 'off'/>
                </div>
                <Conditional value = {statuses?.username?.message}>
                    <Text id = 'user-profile-username-input-error' preset = 'profile-error' classes = 'w-full'>
                        {statuses?.username?.message}
                    </Text>
                </Conditional>
            </div>
        )
    }
    else {
        return (
            <div id = 'user-profile-username-container' className = 'w-full flex flex-row gap-tiny'>
                <Text id = 'user-profile-username' classes = 'text-ellipsis !font-bold overflow-hidden !text-xl w-full'>
                    {'@' + username}
                </Text>
            </div>
        )
    }

    function onChange(event) {
        if (isCurrentUser) {
            onInputChange('username', event.target.value, 'text')
        }
    }
}

function Bio({ bio }) {
    const { isCurrentUser } = useUserContext()
    const { input, onInputChange, statuses, isLoading, isEditing } = useProfileContext()

    if (isEditing || isLoading) {
        return (
            <div id = 'user-profile-bio-input-container' className = 'w-full flex flex-col items-center'>
                <div id = 'user-profile-bio-input-input-container' className = 'w-full flex flex-row items-center'>
                    <Input id = 'user-profile-bio-input' preset = 'profile' classes = '!font-normal !text-lg !text-left' status = {statuses?.bio} value = {input?.bio} onChange = {(e) => onChange(e)} placeholder = {bio} autoComplete = 'off'/>
                </div>
                <Conditional value = {statuses?.bio?.message}>
                    <Text id = 'user-profile-bio-input-error' preset = 'profile-error' classes = 'w-full'>
                        {statuses?.bio?.message}
                    </Text>
                </Conditional>
            </div>
        )
    }
    else {
        return (
            <div id = 'user-profile-bio-container' className = 'w-full flex flex-row'>
                <Text id = 'user-profile-bio' classes = 'text-ellipsis overflow-hidden !font-normal !text-lg w-full'>
                    {bio}
                </Text>
            </div>
        )
    }

    function onChange(event) {
        if (isCurrentUser) {
            onInputChange('bio', event.target.value, 'text')
        }
    }
}

function Picture({ picture }) {
    const { isCurrentUser } = useUserContext()
    const { input, onInputChange, statuses, isLoading, isEditing } = useProfileContext()
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)
    const [params, onCrop, croppedImage] = useCropper(input?.picture)

    useEffect(() => {
        if (isCurrentUser && croppedImage) {
            setIsCropping(false)
            onInputChange('picture', croppedImage, 'image')
        }
    }, [croppedImage])

    useEffect(() => {
        if (isCurrentUser && isEditing === false) {
            setIsCropping(false)
        }
    }, [isEditing])

    return (
        <div id = 'user-profile-picture-container' className = 'relative flex flex-col justify-center items-center h-full aspect-square w-min gap-tiny'>
            <input id = 'user-profile-picture-input' style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Image external id = 'user-profile-picture' path = {(isCropping || !input?.picture) ? picture : input?.picture} classes = {'relative h-full aspect-square rounded-full overflow-hidden z-10' + (isEditing ? ' cursor-pointer' : '')} mode = 'cover' onClick = {() => onPictureClick()}>
                <Conditional value = {isCropping}>
                    <Cropper {...params}/>
                    <Text id = 'user-profile-picture-cropper-error' preset = 'profile-error'>{statuses?.picture?.message}</Text>
                </Conditional>
            </Image>
            <Text id = 'user-profile-picture-save' classes = {'transition-all duration-main flex items-center justify-center !text-sm !cursor-pointer hover:scale-main rounded-main bg-reverse-0 dark:bg-base-0 !bg-opacity-faint overflow-hidden px-tiny animate__animated !animate__fast ' + (isCropping ? 'h-5 animate__slideInDown' : 'h-0 animate__slideOutUp')} onClick = {() => isCropping ? onCrop() : null}>
                Save
            </Text>
        </div>
    )

    function onUpload(event) {
        if (isCurrentUser) {
            if (!isLoading && event.target.files[0]) {
                setIsCropping(true)
                onInputChange('picture', event.target.files[0], 'image')
            }
            event.currentTarget.value = null
        }
    }

    function onPictureClick() {
        if (isCurrentUser && !isLoading && isEditing && !isCropping) {
            pictureInput.current.click()
        }
    }
}

function Subscriptions({ subscribers, subscriptions }) {
    const { setSearchSpace } = useUserContext()

    return (
        <div id = 'user-profile-subscriptions-container' className = 'w-full flex flex-col items-between gap-tiny md:gap-small'>
            <div id = 'user-profile-subscriptions-container' className = 'w-full flex flex-row justify-between items-center'>
                <div id = 'user-profile-subscribers-container' className = 'flex flex-col  w-[50%]'>
                    <Text id = 'user-profile-subscribers-text' classes = '!font-medium !text-lg'>
                        Subscribers
                    </Text>
                    <Text id = 'user-profile-subscribers-value' classes = '!font-bold !text-4xl !cursor-pointer' onClick = {() => setSearchSpace(subscribers)}>
                        {subscribers?.length}
                    </Text>
                </div>
                <div id = 'user-profile-subscriptions-container' className = 'flex flex-col items-end w-[50%]'>
                    <Text id = 'user-profile-subscriptions-text' classes = '!font-medium !text-lg'>
                        Subscriptions
                    </Text>
                    <Text id = 'user-profile-subscriptions-value' classes = '!font-bold !text-4xl text-right !cursor-pointer' onClick = {() => setSearchSpace(subscriptions)}>
                        {subscriptions?.length}
                    </Text>
                </div>
            </div>
            <Action/>
        </div>
    )
}

function Action() {
    const { currentUser, refreshCurrentUser } = useRootContext()
    const { user, isCurrentUser } = useUserContext()
    const { isEditing, setIsEditing, isLoading, execute, statuses, setStatus, input } = useProfileContext()
    const { updateProfile, subscribe, unsubscribe } = useDatabase()
    const [changes, setChanges] = useState()

    useEffect(() => {
        setChanges({
            username: {
                attemptedToChange: input?.username !== currentUser?.username && input?.username !== '',
                didChange: false,
                changedTo: input?.username
            },
            picture: {
                attemptedToChange: input?.picture !== '',
                didChange: false,
                changedTo: input?.picture
            },
            display_name: {
                attemptedToChange: input?.display_name !== currentUser?.display_name && input?.display_name !== '',
                didChange: false,
                changedTo: input?.display_name
            },
            bio: {
                attemptedToChange: input?.bio !== currentUser?.bio && input?.bio !== '',
                didChange: false,
                changedTo: input?.bio
            }
        })
    }, [currentUser, input])

    return (
        <div id = 'user-profile-action-container' className = 'relative w-full flex flex-col items-center'>
            <Button id = 'user-profile-action-button' classes = {'z-10 h-11 !p-0 overflow-hidden w-full animate__animated !animate__slow' + (atLeastOneChangeFailed() ? ' animate__headShake' : allChangesWereSuccessful() ? ' animate__bounce' : '')} onClick = {() => onAction()}>
                <Conditional value = {isLoading}>
                    <Image id = 'user-profile-action-loading' path = 'images/loading.gif' classes = 'h-6 aspect-square m-1 opacity-main'/>
                </Conditional>
                <Conditional value = {!isLoading}>
                    <Text id = 'user-profile-action-text' preset = 'button' classes = '!text-lg !font-medium'>
                        {user ? isCurrentUser ? isEditing ? 'Save Changes' : 'Edit Profile' : currentUserIsSubscribedToUser() ? 'Unsubscribe' : 'Subscribe' : '' }
                    </Text>
                </Conditional>
            </Button>
            <Conditional value = {isCurrentUser}>
                <div id = 'user-profile-action-cancel-container' className = 'absolute top-[100%] w-full h-min flex flex-col items-center overflow-hidden'>
                    <Text id = 'user-profile-action-cancel' classes = {'transition-all duration-main !text-base !cursor-pointer overflow-hidden animate__animated !animate__fast ' + (isEditing ? 'h-6 animate__slideInDown' : 'h-0 animate__slideOutUp')} onClick = {() => onCancel()}>
                        Done
                    </Text>
                </div>
            </Conditional>
        </div>
    )

    function atLeastOneChangeFailed() {
        return statuses && Object.keys(statuses).some(status => statuses[status].status === false)
    }
    function allChangesWereSuccessful() {
        return statuses && (Object.keys(statuses).every(status => statuses[status].status !== false) && Object.keys(statuses).some(status => statuses[status].status === true))
    }
    function currentUserIsSubscribedToUser() {
        return user && user.subscribers.some(subscriber => subscriber.id === currentUser?.id)
    }

    function onCancel() {
        if (isCurrentUser) {
            setIsEditing(false)
        }
    }

    async function submitChanges() {
        if (isCurrentUser) {
            if (!isLoading) {
                for await (const i of Object.keys(changes)) {
                    if (changes[i].attemptedToChange) {
                        await execute(async () => {
                            const { status, message } = await updateProfile(i, input[i])
                            setStatus(i, status, message, 3000)
                            changes[i] = {...changes[i], didChange: status}
                        })
                    }
                }
                if (!atLeastOneChangeFailed()) {
                    await refreshCurrentUser()
                }
                if (allChangesWereSuccessful()) {
                    setIsEditing(false)
                }
            }
        }
    }

    async function onAction() {
        if (isCurrentUser) {
            if (isEditing) {
                if (!isLoading) { submitChanges() }
            }
            else { setIsEditing(true) }
        }
        else if (user) {
            if (currentUserIsSubscribedToUser()) {
                await unsubscribe(user.id)
            }
            else {
                await subscribe(user.id)
            }
        }
    }
}

function SubscriptionsModal() {
    const { searchSpace, setSearchSpace } = useUserContext()
    const { input, onInputChange, results, setParams } = useSearch()
    const ref = useRef(null)
    useCancelDetector(ref, () => setSearchSpace(null))
    useEffect(() => {
        if (searchSpace) {
            setParams({
                limit: null,
                space: searchSpace,
                keys: ['username', 'display_name'],
                minimumLength: 3
            })
        }
    }, [searchSpace])

    return (
        <div id = 'subscriptions-modal-container' className = {'absolute w-full h-full flex flex-col items-center justify-center animate__animated z-20'}>
            <div ref = {ref} id = 'subscriptions-modal' className = 'w-[80%] md:w-[60%] h-[90%] md:h-[80%] flex flex-col gap-small bg-reverse-0 dark:bg-base-0 rounded-main overflow-scroll p-8'>
                <Input id = 'subscriptions-modal-search-input' preset = 'search' classes = '!text-base-0 dark:!text-reverse-0 !text-2xl md:!text-3xl' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = 'Search...' autoComplete = 'off' autoFocus/>
                {results.length > 0 && results.map((result, index) => {
                    return (
                        <Result key = {index} user = {result}/>
                    )
                })}
            </div>
        </div>
    )

    function Result({user}) {
        let id = 'subscription-modal-' + user.username + '-'
        return (
            <Link to = {'/user?id=' + user.id} id = {id + 'container'} className = 'transition-all duration-main w-min h-min flex flex-row items-center gap-small origin-left hover:scale-main' onClick = {() => setSearchSpace(null)}>
                <Image external path = {user.picture} id = {id + 'image'} classes = 'h-10 md:h-10 aspect-square rounded-full'/>
                <div id = {id + 'text-container'} className = 'flex flex-col'>
                    <Text id = {id + 'text-display_name'} classes = '!text-base-0 dark:!text-reverse-0 !text-2xl md:!text-2xl'>
                        {user.display_name}
                    </Text>
                    <Text id = {id + 'text-username'} classes = '!text-base-0 dark:!text-reverse-0 !text-xl md:!text-lg !text-opacity-main -mt-tiny'>
                        {'@' + user.username}
                    </Text>
                </div>
            </Link>
        )
    }
}

function Slips() {
    return (
        <div className = 'user-data flex flex-col gap-small md:gap-smaller grow w-full md:w-min h-full animate__animated animate__slideInDown'>
            <div id = 'user-slips' className = 'w-full h-full backdrop-blur-main rounded-main'>

            </div>
        </div>
    )
}

function Stats() {
    return (
        <div id = 'user-stats' className = 'user-data flex flex-col gap-small md:gap-smaller grow w-full md:w-min h-full backdrop-blur-main rounded-main animate__animated animate__slideInRight'>
            
        </div>
    )
}