import { useRootContext } from '../contexts/root'
import { useValidator } from '../hooks/useValidator'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'
import Input from '../components/input'
import { useEffect, useState } from 'react'
import { useLoader } from '../hooks/useLoader'
import { useStatuses } from '../hooks/useStatuses'

export default function Settings() {
    const { user, refreshUser, signout, update } = useRootContext()
    const [validateInput] = useValidator()
    const [isEditing, setIsEditing] = useState()
    const [isLoading, execute] = useLoader()
    const [statuses, setStatus] = useStatuses(['username', 'picture'])
    const [inputs, setInputs] = useState({ username: user ? user?.username : '', picture: null })
    const onInputChange = (category, value) => {
        if (!isLoading) {
            let newInputs = inputs
            newInputs[category] = value
            setInputs({...newInputs})
            validateInput(category, value, statuses, setStatus)
        }
    }

    async function submitChanges() {
        if (!isLoading) {
            if (inputs.username !== user?.username) {
                if (statuses.username.status !== false) {
                    await execute(async () => {
                        const { status, message } = await update({table: 'Users', data: {'username': inputs.username}, fn: 'update-user'})
                        setStatus('username', status, message)
                        if (status) {
                            await refreshUser()
                            setIsEditing(false)
                        }
                    })
                }
            }
            if (inputs.picture) {
    
            }
        }
    }

    useEffect(() => {
        if (!isEditing) {
            setInputs({ username: user ? user?.username : '', picture: null })
            setStatus('username', null, '')
        }
    }, [isEditing])

    return (
        <div id = 'settings-page' className = 'flex flex-col items-center justify-center gap-4'>
            <Helmet>
                <title>settings | betsy</title>
            </Helmet>
            <div id = 'settings-header' className = 'w-full flex flex-row justify-between items-center'>
                <Text preset = 'title'>
                    settings
                </Text>
                <Text classes = 'cursor-pointer !text-2xl' onClick = {() => isLoading ? null : setIsEditing(!isEditing)}>
                    {isEditing || isLoading ? 'done' : 'edit'}
                </Text>
            </div>
            <div id = 'settings' className = 'w-full h-full flex flex-col items-center gap-2'>
                <Image path = {user?.picture} classes = 'h-48 aspect-square rounded-full'/>
                {isEditing || isLoading ?
                <div id = 'settings-username-input-container' className = 'transition-all duration-main flex flex-col items-center'>
                    <Input id = 'settings-username-input' preset = 'settings' status = {statuses.username.status} value = {inputs.username} onChange = {(e) => onInputChange('username', e.target.value)} placeholder = {user?.username} autoComplete = 'off'/>
                    <Text preset = 'settings-error'>{statuses.username.message}</Text>
                </div>
                :
                <Text classes = 'whitespace-nowrap !font-bold'>
                    {user?.username}
                </Text>
                }
                <div id = 'favorites' className = 'h-min w-full overflow-scroll scroll-smooth'>

                </div>
                <Button classes = 'min-w-[20%]' onClick = {() => isEditing ? submitChanges() : isLoading ? null : signout()}>
                    {isLoading ? 
                    <Image path = 'images/loading.gif' classes = 'h-6 aspect-square m-1'/>
                    :
                    <Text preset = 'button'>
                        {isEditing || isLoading ? 'save changes' : 'sign out'}
                    </Text>}
                </Button>
            </div>
        </div>
    )
}