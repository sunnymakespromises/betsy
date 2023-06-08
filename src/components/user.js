import { useUsersContext } from '../contexts/users'
import { ProfileProvider as Provider, useProfileContext } from '../contexts/profile'
import { useRootContext } from '../contexts/root'
import Image from './image'
import Text from './text'
import Button from './button'
import { FaAngleLeft } from '@react-icons/all-files/fa/FaAngleLeft'
import calculateWallet from '../lib/calculateWallet'
import { useEffect, useRef, useState } from 'react'
import { useLoading } from '../hooks/useLoading'
import { useStatuses } from '../hooks/useStatuses'
import { useInputs } from '../hooks/useInputs'
import { useCropper } from '../hooks/useCropper'
import Cropper from 'react-easy-crop'
import { useDatabase } from '../hooks/useDatabase'
import Input from './input'

export default function User() {
    const { currentUser } = useRootContext()
    const [isEditing, setIsEditing] = useState()
    const [isLoading, execute] = useLoading()
    const [statuses, setStatus, clearAllStatuses] = useStatuses(['username', 'picture'])
    const [inputs, clearInput, clearAllInputs, onInputChange] = useInputs(['username', 'picture'])
    const { username, user } = useUsersContext()
    const isCurrentUser = currentUser?.id === user?.id
    const context = { isCurrentUser, isEditing, setIsEditing, isLoading, execute, statuses, setStatus, clearAllStatuses, inputs, clearInput, clearAllInputs, onInputChange }

    useEffect(() => {
        if (isCurrentUser && isEditing === false) {
            clearAllInputs()
            clearAllStatuses()
        }
    }, [isEditing])

    return (
        <Provider value = {context}>
            <div id = 'user' className = {'absolute transition-all duration-main w-full h-full flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-8' + (username ? ' translate-x-0 opacity-1' : ' translate-x-[100%] opacity-0')}>
                <div id = 'user-profile' className = 'transition-all duration-main flex flex-col items-start md:items-center gap-4 md:gap-4 w-full h-44 md:w-64 md:h-full origin-top'>
                    <Username username = {user?.username}/>
                    <div id = 'user-profile-idek-tbh' className = 'w-full flex flex-row md:flex-col gap-4'>
                        <Picture picture = {user?.picture}/>
                        <Follows/>
                    </div>
                </div>
                <div id = 'user-data' className = 'transition-all duration-main flex flex-col md:flex-row gap-2 md:gap-4 grow md:h-full w-full md:w-min'>
                    <div id = 'user-wallet' className = 'w-full h-[55%] md:w-[55%] md:h-full flex flex-col gap-2 md:gap-4'>
                        <Text classes = '!text-4xl md:!text-6xl !font-extrabold opacity-main'>
                            {'$' + (user ? calculateWallet(user.slips) : '0')}
                        </Text>
                        <div id = 'user-graph' className = 'aspect-square w-min h-full md:w-full md:h-min bg-base-0 rounded-main shadow-main'>

                        </div>
                    </div>
                    <div id = 'user-slips' className = 'w-full h-[45%] md:w-[45%] md:h-full flex flex-col gap-2'>
                        
                    </div>
                </div>
            </div>
        </Provider>
    )
}



function Username({username}) {
    const { navigate } = useRootContext()
    const { isCurrentUser, inputs, statuses, isLoading, isEditing, onInputChange } = useProfileContext()

    if (isEditing || isLoading) {
        return (
            <div id = 'user-profile-username-input-container' className = 'w-full flex flex-col items-center'>
                <div id = 'user-profile-username-input-input-container' className = 'w-full flex flex-row items-center gap-2'>
                    <FaAngleLeft id = 'user-profile-username-input-icon' onClick = {() => navigate(-1)} className = 'w-8 h-8 cursor-pointer opacity-faint'/>
                    <Input id = 'user-profile-username-input' preset = 'profile' status = {statuses?.username} value = {inputs?.username} onChange = {(e) => onChange(e)} placeholder = {username} autoComplete = 'off'/>
                </div>
                {statuses?.username?.message ? <Text id = 'user-profile-username-input-error' preset = 'profile-error'>{statuses?.username?.message}</Text> : null}
            </div>
        )
    }
    else {
        return (
            <div id = 'user-profile-username-container' className = 'w-full flex flex-row items-center gap-2'>
                <FaAngleLeft id = 'user-profile-username-icon' onClick = {() => navigate(-1)} className = 'w-8 h-8 cursor-pointer opacity-faint'/>
                <Text id = 'user-profile-username' classes = 'text-ellipsis overflow-hidden !font-extrabold h-9 md:h-10 md:!text-4xl w-full opacity-main'>
                    {username}
                </Text>
            </div>
        )
    }

    function onChange(event) {
        if (isCurrentUser) {
            onInputChange('username', event.target.value)
        }
    }
}



function Picture({picture}) {
    const { isCurrentUser, inputs, clearInput, statuses, isLoading, isEditing, onInputChange } = useProfileContext()
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)
    const [params, onCrop, croppedImage] = useCropper(inputs?.picture)

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
        <div id = 'user-profile-picture-container' className = 'transition-all duration-main flex flex-row aspect-square h-full w-min md:w-full md:h-min'>
            <input id = 'user-profile-picture-input' style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Image external id = 'user-profile-picture' path = {(isCropping || !inputs?.picture) ? picture : inputs?.picture} classes = {'transition-all duration-main w-full h-full rounded-full shadow-main' + (isEditing ? ' cursor-pointer' : '') + (picture ? ' opacity-1' : ' opacity-0')} mode = 'cover' onClick = {() => onPictureClick()}/>
            {isCropping ? (
            <div id = 'user-profile-picture-cropper-container' className = 'transition-all duration-main flex flex-col items-center justify-center absolute top-0 left-0 w-full h-full  rounded-main p-8'>
                <div id = 'user-profile-picture-cropper' className = 'transition-all duration-main relative w-[90%] md:w-[50%] h-min bg-base-0 rounded-main p-8 flex flex-col items-center gap-2 overflow-hidden shadow-main'>
                    <div id = 'user-profile-picture-cropper-idk' className = 'relative transition-all duration-main w-full aspect-square'>
                        <Cropper {...params}/>
                    </div>
                    <Text id = 'user-profile-picture-cropper-error' preset = 'profile-error'>{statuses?.picture?.message}</Text>
                    <div id = 'user-profile-picture-cropper-buttons' className = 'w-full flex flex-row justify-between'>
                        <Button id = 'user-profile-picture-cropper-cancel-button' preset = 'profile-picture-crop' onClick = {() => onCancel()}>
                            <Text id = 'user-profile-picture-cropper-cancel-button-text' preset = 'profile-picture-button'>
                                cancel
                            </Text>
                        </Button>
                        <Button id = 'user-profile-picture-cropper-save-button' preset = 'profile-picture-crop' onClick = {() => onCrop()}>
                            <Text id = 'user-profile-picture-cropper-save-button-text' preset = 'profile-picture-button'>
                                save image
                            </Text>
                        </Button>
                    </div>
                </div>
            </div>):null}
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
        if (isCurrentUser && !isLoading && isEditing) {
            pictureInput.current.click()
        }
    }

    function onCancel() {
        if (isCurrentUser) {
            setIsCropping(false)
            clearInput('picture')
        }
    }
}


function Action() {
    const { currentUser, refreshCurrentUser } = useRootContext()
    const { user, onFollowButtonClick, onSubmitChanges } = useUsersContext()
    const { isCurrentUser, inputs, statuses, setStatus, isLoading, execute, isEditing, setIsEditing } = useProfileContext()
    const { updateProfile } = useDatabase()
    const changes = {
        username: {
            didChange: inputs?.username !== currentUser?.username && inputs?.username !== '',
            changedTo: inputs?.username
        },
        picture: {
            didChange: inputs?.picture !== '',
            changedTo: inputs?.picture
        }
    }
    const oneChangeFailed = statuses?.username?.status === false || statuses?.picture?.status === false
    const allChangesWereSuccessful = (!(statuses?.username?.status === false) && !(statuses?.picture?.status === false)) && (statuses?.username?.status || statuses?.picture?.status)

    return (
        <div id = 'user-profile-action-container' className = 'w-full flex flex-col items-center'>
            <Button id = 'user-profile-action-button' classes = {'h-11 md:h-16 !p-0 overflow-hidden !duration-slow w-full' + (oneChangeFailed ? ' shake' : allChangesWereSuccessful ? ' nod' : '')} onClick = {() => onAction()}>
                {isLoading ? 
                <Image id = 'user-profile-action-loading' path = 'images/loading.gif' classes = 'h-6 aspect-square m-1'/>
                :
                <Text id = 'user-profile-action-text' preset = 'button' classes = '!text-lg md:!text-2xl'>
                    {user ? isCurrentUser ? isEditing ? 'save changes' : 'edit profile' : user.follows.followers.filter((follow) => follow.follower === currentUser.id).length !== 0 ? 'unfollow' : 'follow' : '' }
                </Text>}
            </Button>
            {isCurrentUser ?
            <Text id = 'user-profile-action-cancel' classes = {'transition-all duration-fast !text-lg opacity-faint !cursor-pointer overflow-hidden' + (isEditing ? ' h-7 translate-y-0' : ' h-0 -translate-y-[100%]')} onClick = {() => onCancel()}>
                cancel
            </Text>
            :null}
        </div>
    )

    function onCancel() {
        if (isCurrentUser) {
            setIsEditing(false)
        }
    }

    async function submitChanges() {
        if (isCurrentUser) {
            if (!isLoading) {
                for await (const input of Object.keys(changes)) {
                    if (changes[input].didChange) {
                        await execute(async () => {
                            const { status, message } = await updateProfile(input, inputs[input])
                            setStatus(input, status, message, 3000)
                            if (status) {
                                await refreshCurrentUser()
                            }
                        })
                    }
                }
                onSubmitChanges(changes)
                if (allChangesWereSuccessful) {
                    setIsEditing(false)
                }
            }
        }
    }

    function onAction() {
        if (isCurrentUser) {
            if (isEditing) {
                if (!isLoading) {
                    submitChanges()
                }
            }
            else {
                setIsEditing(true)
            }
        }
        else {
            onFollowButtonClick()
        }
    }
}



function Follows() {
    const { user } = useUsersContext()

    return (
        <div id = 'user-profile-follows-container' className = 'grow flex flex-col items-center gap-1 md:gap-2'>
            <div id = 'user-profile-follows-text-container' className = 'w-full flex flex-row justify-between items-center'>
                <div id = 'user-profile-followers-container' className = 'flex flex-col'>
                    <Text id = 'user-profile-followers-text' classes = '!font-medium !text-base md:!text-xl opacity-faint'>
                        followers
                    </Text>
                    <Text id = 'user-profile-followers-value' classes = '!font-extrabold h-9 md:h-12 !text-3xl md:!text-5xl opacity-main'>
                        {user ? user.follows.followers.length : ''}
                    </Text>
                </div>
                <div id = 'user-profile-following-container' className = 'flex flex-col'>
                    <Text id = 'user-profile-following-text' classes = '!font-medium !text-base md:!text-xl opacity-faint'>
                        following
                    </Text>
                    <Text id = 'user-profile-following-value' classes = '!font-extrabold h-9 md:h-12 !text-3xl md:!text-5xl opacity-main'>
                        {user ? user.follows.following.length : ''}
                    </Text>
                </div>
            </div>
            <Action/>
        </div>
    )
}