import { memo, useEffect, useMemo, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { IconHeart } from '@tabler/icons-react'
import _ from 'lodash'
import { CheckRounded, CloudUpload, ContentCopyRounded } from '@mui/icons-material'
import { useUserContext } from '../contexts/user'
import { useStatuses } from '../hooks/useStatuses'
import { useInput } from '../hooks/useInput'
import { useCropper } from '../hooks/useCropper'
import { useLoading } from '../hooks/useLoading'
import { useCancelDetector } from '../hooks/useCancelDetector'
import { useDatabase } from '../hooks/useDatabase'
import Conditional from './conditional'
import Input from './input'
import Text from './text'
import Image from './image'

const Profile = memo(function Profile({ userId = null, canEdit = true, parentId }) {
    const { currentUser } = useUserContext()
    const [user, setUser] = useState()
    const { getUserBy } = useDatabase()
    const isCurrentUser = useMemo(() => userId ? currentUser?.id === userId : true, [currentUser, userId])
    const { statuses, setStatuses } = useStatuses(['username', 'display_name', 'picture', 'bio'])
    const { input, onInputChange, inputIsEmpty, isThisInputEmpty, clearAllInput } = useInput(['username', 'display_name', 'picture', 'bio'])
    const [pictureParams, onCrop] = useCropper(input.picture)
    const [isLoading, execute] = useLoading()

    useEffect(() => {
        async function updateUser() {
            if (isCurrentUser) {
                setUser(currentUser)
            }
            else {
                let { status, user } = await getUserBy('id', userId)
                if (status) {
                    setUser(user)
                }
            }
        }

        updateUser()
    }, [currentUser, userId])

    let DOMId = parentId + 'profile-'
    if (user) {
        return (
            <div id = {DOMId + 'container'} className = 'relative flex flex-row items-start w-full md:w-[24rem] h-min rounded-main p-small gap-small bg-base-highlight'>
                <Picture params = {pictureParams} picture = {user.picture} input = {input.picture} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.picture} isCurrentUser = {isCurrentUser} isLoading = {isLoading} canEdit = {canEdit} parentId = {DOMId}/>
                <div id = {DOMId + 'info-container'} className = {'w-full h-full flex flex-col justify-between'}>
                    <Info category = 'display_name' value = {user.display_name} input = {input.display_name} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.display_name} isCurrentUser = {isCurrentUser} isLoading = {isLoading} canEdit = {canEdit} parentId = {DOMId}/>
                    <Info category = 'username' classes = '-mt-tiny' value = {user.username} input = {input.username} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.username} isCurrentUser = {isCurrentUser} isLoading = {isLoading} canEdit = {canEdit} parentId = {DOMId}/>
                    <Info category = 'bio' classes = '-mt-tiny' value = {user.bio} input = {input.bio} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.bio} isCurrentUser = {isCurrentUser} isLoading = {isLoading} canEdit = {canEdit} parentId = {DOMId}/>
                </div>
                <div id = {DOMId + 'actions-container'} className = 'flex flex-col w-6 gap-micro'>
                    <Conditional value = {!isCurrentUser && user}>
                        <Subscription user = {user} id = {currentUser?.id} isCurrentUser = {isCurrentUser} parentId = {DOMId}/>
                    </Conditional>
                    <Copy id = {user.id} parentId = {DOMId}/>
                    <Conditional value = {isCurrentUser && canEdit}>
                        <Save user = {user} currentUser = {currentUser} onCrop = {onCrop} input = {input} statuses = {statuses} setStatuses = {setStatuses} execute = {execute} inputIsEmpty = {inputIsEmpty} clearAllInput = {clearAllInput} isCurrentUser = {isCurrentUser} parentId = {DOMId}/>
                    </Conditional>
                </div>
            </div>
        )
    }
}, (b, a) => _.isEqual(b.userId, a.userId) && b.canEdit === a.canEdit)

const Info = memo(function Info({ category, value, classes, input, onInputChange, isThisInputEmpty, status, isCurrentUser, isLoading, canEdit, parentId }) {
    const thisInputIsEmpty = useMemo(() => isThisInputEmpty(category), [input])
    const [isEditing, setIsEditing] = useState(false)
    const clickRef = useCancelDetector(() => (isCurrentUser && thisInputIsEmpty) ? setIsEditing(false) : null)
    useEffect(() => {
        if (!isLoading) {
            setIsEditing(false)
        }
    }, [isLoading])

    let DOMId = parentId + category + '-'
    return (
        <div ref = {clickRef} id = {DOMId + 'container'} className = {'w-full flex flex-col' + (classes ? ' ' + classes : '')} onClick = {() => onClick()}>
            <div id = {DOMId + 'value-container'} className = {(isEditing ? 'w-full' : 'w-min') + ' flex flex-row items-center' + (isCurrentUser && canEdit ? ' cursor-pointer' : '')}>
                <Conditional value = {(isEditing || (isLoading && !thisInputIsEmpty)) && !status.status}>
                    <Input id = {DOMId + 'input'} preset = {'profile-' + category} status = {status.status} value = {input} onChange = {(e) => onChange(e)} placeholder = {value} autoFocus autoComplete = 'off'/>
                </Conditional>
                <Conditional value = {(!isEditing || (isLoading && thisInputIsEmpty)) || status.status}>
                    <Text id = {DOMId + 'text'} preset = {'profile-' + category} classes = {isCurrentUser && canEdit ? 'hover:text-text-highlight' : ''}>
                        {value}
                    </Text>
                </Conditional>
                <Conditional value = {status.status}>
                    <CheckRounded id = {DOMId + 'icon'} className = {'!transition-all duration-main ' + (status.status ? '!w-4' : '!w-0') + ' !h-4 text-primary-main !animate-duration-300 animate-fadeOutRight'}/>
                </Conditional>
            </div>
            <Error message = {status.message} parentId = {DOMId}/>
        </div>
    )

    function onClick() {
        if (isCurrentUser && !isEditing && canEdit) {
            setIsEditing(true)
        }
    }

    function onChange(event) {
        if (isCurrentUser) {
            onInputChange(category, event.target.value, 'text')
        }
    }
}, (b, a) => b.category === a.category && b.value === a.value && b.classes === a.classes && b.input === a.input && b.isThisInputEmpty === a.isThisInputEmpty && _.isEqual(b.status, a.status) && b.isCurrentUser === a.isCurrentUser && b.isLoading === a.isLoading)

const Picture = memo(function Picture({ params, picture, input, onInputChange, isThisInputEmpty, status, isCurrentUser, isLoading, canEdit, parentId }) {
    const thisInputIsEmpty = useMemo(() => isThisInputEmpty('picture'), [input])
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            setIsCropping(false)
        }
    }, [isLoading])

    let DOMId = parentId + 'picture-'
    return (
        <div id = {DOMId + 'container'} className = {'transition-all duration-main relative flex flex-col justify-center items-center h-16 md:h-16 aspect-square z-10' + (status.message ? ' w-min' : '')}>
            <input id = {DOMId + 'input'} className = 'hidden' type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Image external id = {DOMId + 'image'} path = {isCropping ? '' : input ? input : picture} classes = {'transition-all duration-main relative h-full aspect-square rounded-full overflow-hidden z-10' + ( isCurrentUser && canEdit ? ' cursor-pointer' : '') + (thisInputIsEmpty ? '' : ' border-thin border-primary-main')} mode = 'cover' onClick = {() => onPictureClick()}>
                <Conditional value = {isCropping}>
                    <Cropper {...params}/>
                    <Error message = {status.message} parentId = {DOMId}/>
                </Conditional>
            </Image>
        </div>
    )

    function onUpload(event) {
        if (isCurrentUser && canEdit) {
            if (event.target.files[0]) {
                setIsCropping(true)
                onInputChange('picture', event.target.files[0], 'image')
            }
            event.currentTarget.value = null
        }
    }

    function onPictureClick() {
        if (isCurrentUser && !isCropping && canEdit) {
            pictureInput.current.click()
        }
    }
}, (b, a) => _.isEqual(JSON.stringify(b.params), JSON.stringify(a.params)) && b.picture === a.picture && b.input === a.input && b.isThisInputEmpty === a.isThisInputEmpty && _.isEqual(b.status, a.status) && b.isCurrentUser === a.isCurrentUser && b.isLoading === a.isLoading)

const Save = memo(function Save({ currentUser, input, onCrop, statuses, setStatuses, execute, inputIsEmpty, clearAllInput, parentId }) {
    const { updateProfile } = useDatabase()
    const changes = useMemo(() => {
        let newChanges = {}
        input && Object.keys(input).forEach(i => {
            if (input[i] !== '' && input[i] !== currentUser[i]) {
                newChanges[i] = true
            }
        })
        return newChanges
    }, [input, currentUser])
    const atLeastOneChangeFailed = useMemo(() => statuses && Object.keys(statuses).some(status => statuses[status].status === false), [statuses])
    const allChangesWereSuccessful = useMemo(() => statuses && (Object.keys(statuses).every(status => statuses[status].status !== false) && Object.keys(statuses).some(status => statuses[status].status === true)), [statuses])

    useEffect(() => {
        if (allChangesWereSuccessful) {
            clearAllInput()
        }
    }, [statuses])

    let DOMId = parentId + 'action-'
    if (currentUser && !inputIsEmpty) {
        return (
            <div id = {DOMId + 'container'} className = {'group/edit flex w-full aspect-square animate-duration-300' + (atLeastOneChangeFailed ? ' animate-headShake' : '')}>
                <CloudUpload id = {DOMId + 'icon'} className = '!w-full !h-full text-primary-main cursor-pointer' onClick = {() => onAction()}/>
            </div>
        )
    }

    async function onAction() {
        await execute(async () => {
            let promises = []
            for (const i of Object.keys(changes)) {
                promises.push(updateProfile(i, i === 'picture' ? URL.createObjectURL(await onCrop()) : input[i]))
            }
            await Promise.all(promises).then((values) => {
                let newStatuses = {...statuses}
                for (const i of Object.keys(changes)) {
                    let { status, message } = values[Object.keys(changes).indexOf(i)]
                    newStatuses[i] = { status: status, message: message }
                }
                setStatuses(newStatuses, 6000)
            })
        })
    }
}, (b, a) => _.isEqual(b.currentUser, a.currentUser) && _.isEqual(b.input, a.input) && _.isEqual(b.statuses, a.statuses) && b.inputIsEmpty === a.inputIsEmpty)

const Subscription = memo(function Subscription({ user, id, parentId }) {
    const { subscribe, unsubscribe } = useDatabase()
    const currentUserIsSubscribedToUser = useMemo(() => user && user.subscribers.some(subscriber => subscriber.id === id), [id, user])

    let DOMId = parentId + 'subscription-'
    return (
        <div id = {DOMId + 'container'} className = {'group/subscription flex w-full aspect-square'} onClick = {() => onClick()}>
            <IconHeart id = {DOMId + 'icon'} className = {'transition-all duration-main w-full h-full cursor-pointer !animate-duration-700 group-hover/subscription:animate-heartBeat ' + (currentUserIsSubscribedToUser ? 'fill-primary-main text-primary-main' : 'text-primary-main/killed fill-transparent hover:text-primary-main hover:fill-primary-main')} onClick = {onClick}/>
        </div>
    )

    async function onClick() {
        if (currentUserIsSubscribedToUser) {
            await unsubscribe(user.id)
        }
        else {
            await subscribe(user.id)
        }
    }
}, (b, a) => _.isEqual(b.user, a.user) && b.id === a.id)

const Copy = memo(function Copy({ id, parentId }) {
    const [isClicked, setIsClicked] = useState()
    let DOMId = parentId + 'copy-'
    return (
        <div id = {DOMId + 'container'} className = 'group/copy flex w-full aspect-square animate-duration-150 cursor-pointer'>
            <Conditional value = {!isClicked}>
                <ContentCopyRounded id = {DOMId + 'icon'} className = '!transition-all duration-main !w-full !h-full text-primary-main' onClick = {() => onClick()}/>
            </Conditional>
            <Conditional value = {isClicked}>
                <CheckRounded id = {DOMId + 'icon'} className = '!transition-all duration-main !w-full !h-full text-primary-main cursor-pointer' onClick = {() => onClick()}/>
            </Conditional>
        </div>
    )

    function onClick() {
        navigator.clipboard.writeText(process.env.REACT_APP_BASE_URL + '/user?id=' + id)
        setIsClicked(true)
        setTimeout(() => {
            setIsClicked(false)
        }, 1000)
    }
}, (b, a) => b.id === a.id)

const Error = memo(function Error({ message, parentId }) {
    return (
        <div id = {parentId + 'error'} className = {'w-full overflow-hidden transition-all duration-main ' + (message ? 'max-h-[99px]' : 'max-h-[0px]')}>
            <Text id = {parentId + 'text'} preset = 'profile-error'>
                {message}
            </Text>
        </div>
    )
}, (b, a) => b.message === a.message)

export default Profile