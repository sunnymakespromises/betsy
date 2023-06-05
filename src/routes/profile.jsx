import { useRootContext } from '../contexts/root'
import { ProfileProvider as Provider, useProfileContext } from '../contexts/profile'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'
import Input from '../components/input'
import { useRef, useEffect, useState } from 'react'
import { useLoading } from '../hooks/useLoading'
import { useStatuses } from '../hooks/useStatuses'
import { useProfileInputs } from '../hooks/useProfileInputs'
import { useCropper } from '../hooks/useCropper'
import Cropper from 'react-easy-crop'
import { useDatabase } from '../hooks/useDatabase'

export default function Profile() {
    const { user } = useRootContext()
    const [isEditing, setIsEditing] = useState()
    const [isLoading, execute] = useLoading()
    const [statuses, setStatus, clearAllStatuses] = useStatuses(['username', 'picture'])
    const [inputs, clearInput, clearAllInputs, onInputChange] = useProfileInputs(['username', 'picture'], setStatus)
    const context = { isEditing, isLoading, execute, statuses, setStatus, clearAllStatuses, inputs, clearInput, clearAllInputs, onInputChange }

    useEffect(() => {
        if (isEditing === false) {
            clearAllInputs()
            clearAllStatuses()
        }
    }, [isEditing])

    return (
        <Provider value = {context}>
            <div id = 'profile-page' className = 'flex flex-col items-center justify-center gap-4'>
                <Helmet><title>my profile | betsy</title></Helmet>
                <div id = 'profile-header' className = 'w-full flex flex-row justify-between items-center'>
                    <Text preset = 'title'>my profile</Text>
                    <Text classes = '!cursor-pointer !text-2xl' onClick = {() => isLoading ? null : setIsEditing(!isEditing)}>{isEditing || isLoading ? 'done' : 'edit'}</Text>
                </div>
                <div id = 'profile' className = 'w-full h-full flex flex-col items-center gap-2'>
                    <Picture picture = {user?.picture}/>
                    <Username username = {user?.username}/>
                    <Action/>
                </div>
            </div>
        </Provider>
    )
}






function Username({username}) {
    const { inputs, statuses, isLoading, isEditing, onInputChange } = useProfileContext()

    if (isEditing || isLoading) {
        return (
            <div id = 'profile-username-input-container' className = 'flex flex-col items-center'>
                <Input id = 'profile-username-input' preset = 'profile' status = {statuses?.username} value = {inputs?.username} onChange = {(e) => onChange(e)} placeholder = {username} autoComplete = 'off'/>
                <Text preset = 'profile-error'>{statuses?.username?.message}</Text>
            </div>
        )
    }
    else {
        return (
            <Text classes = 'whitespace-nowrap !font-bold'>
                {username}
            </Text>
        )
    }

    function onChange(event) {
        onInputChange('username', event.target.value)
    }
}






function Picture({picture}) {
    const { inputs, clearInput, statuses, isLoading, isEditing, onInputChange } = useProfileContext()
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)
    const [params, onCrop, croppedImage] = useCropper(inputs?.picture)

    useEffect(() => {
        if (croppedImage) {
            setIsCropping(false)
            onInputChange('picture', croppedImage)
        }
    }, [croppedImage])

    return (
        <div id = 'profile-picture-container' className = 'flex flex-col items-center h-48 gap-2'>
            <input style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Image external id = 'profile-picture' path = {(isCropping || !inputs?.picture) ? picture : inputs?.picture} classes = {'transition-all duration-main h-full aspect-square rounded-full shadow-main' + (isEditing ? ' cursor-pointer' : '')} mode = 'cover' onClick = {() => onPictureClick()}/>
            {isCropping ? (
            <div id = 'profile-picture-cropper-container' className = 'transition-all duration-main flex flex-col items-center justify-center absolute top-0 left-0 w-full h-full bg-reverse-0 bg-opacity-30 dark:bg-opacity-30 rounded-main p-8'>
                <div id = 'profile-picture-cropper' className = 'transition-all duration-main relative w-[90%] md:w-[50%] h-min bg-base-0 rounded-main p-8 flex flex-col items-center gap-2 overflow-hidden shadow-main'>
                    <div className = 'relative transition-all duration-main w-full aspect-square'>
                        <Cropper {...params}/>
                    </div>
                    <Text preset = 'profile-error'>{statuses?.picture?.message}</Text>
                    <div className = 'w-full flex flex-row justify-between'>
                        <Button preset = 'profile-picture-crop' onClick = {() => onCancel()}>
                            <Text preset = 'profile-picture-button'>
                                cancel
                            </Text>
                        </Button>
                        <Button preset = 'profile-picture-crop' onClick = {() => onCrop()}>
                            <Text preset = 'profile-picture-button'>
                                save image
                            </Text>
                        </Button>
                    </div>
                </div>
            </div>):null}
        </div>
    )

    function onUpload(event) {
        if (!isLoading && event.target.files[0]) {
            setIsCropping(true)
            onInputChange('picture', event.target.files[0])
        }
        event.currentTarget.value = null
    }

    function onPictureClick() {
        if (!isLoading && isEditing) {
            pictureInput.current.click()
        }
    }

    function onCancel() {
        setIsCropping(false)
        clearInput('picture')
    }
}






function Action() {
    const { user, refreshUser, signout } = useRootContext()
    const { updateProfile } = useDatabase()
    const { inputs, statuses, setStatus, isLoading, execute, isEditing } = useProfileContext()
    const changes = {
        username: inputs?.username !== user?.username && inputs?.username !== '',
        picture: inputs?.picture
    }

    return (
        <Button id = 'profile-button' classes = {'min-w-[20%] shadow-small' + (statuses?.username?.status === false || statuses?.picture?.status === false ? ' shake' : (!(statuses?.username?.status === false) && !(statuses?.picture?.status === false)) && (statuses?.username?.status || statuses?.picture?.status) ? ' nod' : '')} onClick = {() => onClick()}>
            {isLoading ? 
            <Image path = 'images/loading.gif' classes = 'h-6 aspect-square m-1'/>
            :
            <Text preset = 'button'>
                {isEditing || isLoading ? 'save changes' : 'sign out'}
            </Text>}
        </Button>
    )

    async function submitChanges() {
        if (!isLoading) {
            Object.keys(changes).forEach(async (input) => {
                if (changes[input]) {
                    await execute(async () => {
                        const { status, message } = await updateProfile(input, inputs[input])
                        setStatus(input, status, message, 3000)
                        if (status) {
                            await refreshUser()
                        }
                    })
                }
            })
        }
    }

    function onClick() {
        if (isEditing) { submitChanges() }
        else if (!isLoading) { signout() }
    }
}