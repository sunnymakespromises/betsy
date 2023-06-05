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
    const context = { isEditing, setIsEditing, isLoading, execute, statuses, setStatus, clearAllStatuses, clearInput, clearAllInputs, onInputChange }

    useEffect(() => {
        console.log(statuses)
    }, [statuses])
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
                    <Text classes = 'cursor-pointer !text-2xl' onClick = {() => isLoading ? null : setIsEditing(!isEditing)}>{isEditing || isLoading ? 'done' : 'edit'}</Text>
                </div>
                <div id = 'profile' className = 'w-full h-full flex flex-col items-center gap-2'>
                    <Picture input = {inputs?.picture} picture = {user?.picture}/>
                    <Username input = {inputs?.username} username = {user?.username}/>
                    <Action inputs = {inputs}/>
                </div>
            </div>
        </Provider>
    )
}






function Username({input, username}) {
    const { statuses, isLoading, isEditing, onInputChange } = useProfileContext()

    if (isEditing || isLoading) {
        return (
            <div id = 'profile-username-input-container' className = 'flex flex-col items-center'>
                <Input id = 'profile-username-input' preset = 'profile' status = {statuses?.username} value = {input} onChange = {(e) => onChange(e)} placeholder = {username} autoComplete = 'off'/>
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






function Picture({input, picture}) {
    const { clearInput, statuses, isLoading, isEditing, onInputChange } = useProfileContext()
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)
    const [params, onCrop, croppedImage] = useCropper(input)

    useEffect(() => {
        if (croppedImage) {
            setIsCropping(false)
            onInputChange('picture', croppedImage)
        }
    }, [croppedImage])

    return (
        <div id = 'profile-picture-container' className = 'flex flex-col items-center h-48 gap-2'>
            <input style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Image id = 'profile-picture' path = {(isCropping || !input) ? picture : input} classes = {'transition-all duration-main h-full aspect-square rounded-full border-thin border-divide-light dark:border-divide-dark' + (isEditing ? ' brightness-90 hover:brightness-75 cursor-pointer' : '')} mode = 'cover' onClick = {() => onPictureClick()}/>
            {isCropping ? (
            <div id = 'profile-picture-cropper-container' className = 'transition-all duration-main flex flex-col items-center justify-center absolute top-0 left-0 w-full h-full bg-reverse-0 bg-opacity-30 dark:bg-opacity-60 rounded-main p-8'>
                <div id = 'profile-picture-cropper' className = 'transition-all duration-main relative w-[90%] md:w-[50%] h-min bg-base-0 rounded-main border-main border-divide-0 dark:border-divide-100 p-8 flex flex-col items-center gap-2 overflow-hidden shadow-main'>
                    <div className = 'relative transition-all duration-main w-full aspect-square'>
                        <Cropper {...params}/>
                    </div>
                    <Text preset = 'profile-error'>{statuses?.picture?.message}</Text>
                    <div className = 'w-full flex flex-row justify-between'>
                        <Button classes = '!p-2' onClick = {() => onCancel()}>
                            <Text preset = 'button'>
                                cancel
                            </Text>
                        </Button>
                        <Button classes = '!border-reverse-0 !p-2' onClick = {() => onCrop()}>
                            <Text preset = 'button' classes = '!text-reverse-0'>
                                save image
                            </Text>
                        </Button>
                    </div>
                </div>
            </div>):null}
        </div>
    )

    function onUpload(event) {
        if (!isLoading) {
            setIsCropping(true)
            onInputChange('picture', event.target.files[0])
        }
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






function Action({inputs}) {
    const { user, refreshUser, signout } = useRootContext()
    const { updateProfile } = useDatabase()
    const { setStatus, isLoading, execute, isEditing, setIsEditing } = useProfileContext()

    return (
        <Button id = 'profile-button' classes = 'min-w-[20%]' onClick = {() => onClick()}>
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
            const changes = {
                username: inputs?.username !== user?.username && inputs?.username !== '',
                picture: inputs?.picture
            }
            Object.keys(changes).forEach(async (input) => {
                if (changes[input]) {
                    await execute(async () => {
                        const { status, message } = await updateProfile(input, inputs[input])
                        setStatus(input, status, message)
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