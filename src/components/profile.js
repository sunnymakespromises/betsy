import { memo, useEffect, useMemo, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { IconHeart } from '@tabler/icons-react'
import _ from 'lodash'
import { CheckRounded, ContentCopyRounded, DownloadDoneRounded, LockRounded } from '@mui/icons-material'
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
import { useCurrency } from '../hooks/useCurrency'
import toDate from '../lib/util/toDate'

const Profile = memo(function Profile({ userId = null, canEdit = true, classes, parentId }) {
    const { currentUser } = useUserContext()
    const [user, setUser] = useState()
    const { getUserBy } = useDatabase()
    const isCurrentUser = useMemo(() => userId ? currentUser.id === userId : true, [currentUser, userId])
    const { statuses, setStatuses } = useStatuses(['display_name', 'picture'])
    const { input, onInputChange, inputIsEmpty, isThisInputEmpty, clearAllInput } = useInput(['display_name', 'picture'])
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
            <div id = {DOMId + 'container'} className = {'relative flex flex-col items-center w-full min-w-[12rem] h-min rounded-main p-main gap-small border-divider-main border-thin md:shadow' + (classes ? ' ' + classes : '')}>
                <Picture params = {pictureParams} picture = {user.picture} input = {input.picture} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.picture} isCurrentUser = {isCurrentUser} isLoading = {isLoading} canEdit = {canEdit && !user.is_locked} isLocked = {user.is_locked} parentId = {DOMId}/>
                <div id = {DOMId + 'info-container'} className = {'w-full h-min flex flex-row justify-center items-center gap-small'}>
                    <Info category = 'display_name' value = {user.display_name} input = {input.display_name} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.display_name} isCurrentUser = {isCurrentUser} isLoading = {isLoading} canEdit = {canEdit && !user.is_locked} parentId = {DOMId}/>
                    <Locked isLocked = {user.is_locked} parentId = {DOMId}/>
                </div>
                <Subtitle balances = {user.balances} date = {user.join_date} parentId = {DOMId}/>
                <Tag id = {user.id} parentId = {DOMId}/>
                <Actions currentUser = {currentUser} isCurrentUser = {isCurrentUser} user = {user}  onCrop = {onCrop} input = {input} statuses = {statuses} setStatuses = {setStatuses} execute = {execute} inputIsEmpty = {inputIsEmpty} clearAllInput = {clearAllInput} canEdit = {canEdit} parentId = {DOMId}/>
            </div>
        )
    }
}, (b, a) => b.canEdit === a.canEdit && b.classes === a.classes && _.isEqual(b.userId, a.userId))

const Subtitle = memo(function Memo({ balances, date, parentId }) {
    const { getAmount } = useCurrency()
    let DOMId = parentId + 'subtitle-'
    return (
        <div id = {parentId + 'subtitle'} className = 'flex items-center'>
            <Text id = {DOMId + '-balance'} preset = {'profile-subtitle'}>
                {getAmount(balances[balances.length - 1].value)}&nbsp;•&nbsp;
            </Text>
            <Text id = {DOMId + '-date'} preset = {'profile-subtitle'}>
                {'Joined ' + toDate(date, true)}
            </Text>
        </div>
    )
}, (b, a) => b.date === a.date && _.isEqual(b.balances, a.balances))

const Tag = memo(function Tag({ id, parentId }) {
    return (
        <Text id = {parentId + 'id'} preset = {'profile-subtitle'} classes = 'absolute top-2 left-2 py-tiny px-small rounded-main border-thin border-divider-main'>
            {'@' + id}
        </Text>
    )
})

const Info = memo(function Info({ category, value, classes, input, onInputChange, isThisInputEmpty, status, isCurrentUser, isLoading, canEdit, parentId }) {
    const thisInputIsEmpty = useMemo(() => isThisInputEmpty(category), [input])
    const [isEditing, setIsEditing] = useState(false)
    const cancelRef = useCancelDetector(() => (isCurrentUser && thisInputIsEmpty) ? setIsEditing(false) : null)
    useEffect(() => {
        if (!isLoading) {
            setIsEditing(false)
        }
    }, [isLoading])

    let DOMId = parentId + category + '-'
    return (
        <div ref = {cancelRef} id = {DOMId + 'container'} className = {'relative max-w-full flex flex-col' + (classes ? ' ' + classes : '')} onClick = {() => onClick()}>
            <div id = {DOMId + 'value-container'} className = {'w-full h-min flex flex-row justify-center items-center' + (isCurrentUser && canEdit ? ' cursor-pointer' : '')}>
                <Conditional value = {(canEdit && (isEditing || (isLoading && !thisInputIsEmpty)) && !status.status)}>
                    <Input id = {DOMId + 'input'} preset = {'profile-' + category} status = {status.status} value = {input} onChange = {(e) => onChange(e)} placeholder = {value} autoFocus autoComplete = 'off'/>
                </Conditional>
                <Conditional value = {(!isEditing || (isLoading && thisInputIsEmpty)) || (status.status)}>
                    <Text id = {DOMId + 'text'} preset = {'profile-' + category} classes = {(isCurrentUser && canEdit ? ' !text-primary-main' : '')}>
                        {value}
                    </Text>
                </Conditional>
                <Conditional value = {canEdit && status.status}>
                    <CheckRounded id = {DOMId + 'icon'} className = 'absolute top-[50%] -translate-y-[50%] left-[100%] !transition-all duration-main !h-4 !aspect-square text-primary-main !animate-duration-700 animate-fadeOut'/>
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
}, (b, a) => b.category === a.category && b.value === a.value && b.classes === a.classes && b.input === a.input && b.isThisInputEmpty === a.isThisInputEmpty && b.isCurrentUser === a.isCurrentUser && b.isLoading === a.isLoading && b.canEdit === a.canEdit && _.isEqual(b.status, a.status))

const Picture = memo(function Picture({ params, picture, input, onInputChange, isThisInputEmpty, status, isCurrentUser, isLoading, canEdit, isLocked, parentId }) {
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
        <div id = {DOMId + 'container'} className = {'transition-all duration-main relative flex flex-col justify-center items-center h-12 aspect-square z-10' + (status.message ? ' w-min' : '') + (isLocked ? ' grayscale' : '')}>
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
}, (b, a) => b.picture === a.picture && b.input === a.input && b.isCurrentUser === a.isCurrentUser && b.isLoading === a.isLoading && b.canEdit === a.canEdit && b.isLocked === a.isLocked && _.isEqual(b.status, a.status) && _.isEqual(JSON.stringify(b.params), JSON.stringify(a.params)))

const Actions = memo(function Actions({ currentUser, user, isCurrentUser, input, onCrop, statuses, setStatuses, execute, inputIsEmpty, clearAllInput, canEdit, parentId }) {
    let DOMId = parentId + 'actions-'
    return (
        <div id = {parentId + 'actions'} className = 'absolute top-2 right-2 flex flex-row h-4 gap-micro'>
            <Conditional value = {!isCurrentUser && user}>
                <Subscription user = {user} subscriptions = {currentUser.subscriptions} isCurrentUser = {isCurrentUser} parentId = {DOMId}/>
            </Conditional>
            <Copy id = {user.id} parentId = {DOMId}/>
            <Conditional value = {isCurrentUser && canEdit}>
                <Save user = {user} currentUser = {currentUser} onCrop = {onCrop} input = {input} statuses = {statuses} setStatuses = {setStatuses} execute = {execute} inputIsEmpty = {inputIsEmpty} clearAllInput = {clearAllInput} isCurrentUser = {isCurrentUser} parentId = {DOMId}/>
            </Conditional>
        </div>
    )
}, (b, a) =>  b.inputIsEmpty === a.inputIsEmpty && b.isCurrentUser === a.isCurrentUser && _.isEqual(b.currentUser, a.currentUser)  && _.isEqual(b.user, a.user) && _.isEqual(b.input, a.input) && _.isEqual(b.statuses, a.statuses))

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

    let DOMId = parentId + 'save-'
    if (currentUser && !inputIsEmpty) {
        return (
            <DownloadDoneRounded id = {DOMId + 'icon'} className = {'!w-4 !h-4 text-primary-main cursor-pointer animate-duration-300' + (atLeastOneChangeFailed ? ' animate-headShake' : '')} onClick = {() => onAction()}/>
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
                let allChangesWereSuccessful = newStatuses && (Object.keys(newStatuses).every(status => newStatuses[status].status !== false) && Object.keys(newStatuses).some(status => newStatuses[status].status === true))
                setStatuses(newStatuses, allChangesWereSuccessful ? 700 : 6000)
            })
        })
    }
}, (b, a) => b.inputIsEmpty === a.inputIsEmpty && _.isEqual(b.currentUser, a.currentUser) && _.isEqual(b.input, a.input) && _.isEqual(b.statuses, a.statuses))

const Subscription = memo(function Subscription({ user, subscriptions, parentId }) {
    const { subscribe, unsubscribe } = useDatabase()
    const currentUserIsSubscribedToUser = useMemo(() => subscriptions && subscriptions.some(subscription => subscription === user.id), [subscriptions, user])

    let DOMId = parentId + 'subscription-'
    return (
        <IconHeart id = {DOMId + 'icon'} className = {'transition-all duration-main w-4 h-4 cursor-pointer text-primary-main ' + (currentUserIsSubscribedToUser ? 'fill-primary-main' : 'hover:fill-primary-main')} onClick = {() => onClick()}/>
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

const Locked = memo(function Locked({ isLocked, parentId }) {
    let DOMId = parentId + 'locked-'
    return (
        <Conditional value = {isLocked}>
            <LockRounded id = {DOMId + 'icon'} className = '!w-3 !h-3 text-text-main'/>
        </Conditional>
    )
})

const Copy = memo(function Copy({ id, parentId }) {
    const [isClicked, setIsClicked] = useState()
    let DOMId = parentId + 'copy-'
    return (
        <>
            <Conditional value = {!isClicked}>
                <ContentCopyRounded id = {DOMId + 'icon'} className = '!w-4 !h-4 text-primary-main cursor-pointer' onClick = {() => onClick()}/>
            </Conditional>
            <Conditional value = {isClicked}>
                <CheckRounded id = {DOMId + 'icon'} className = '!w-4 !h-4 text-primary-main' onClick = {() => onClick()}/>
            </Conditional>
        </>
    )

    function onClick() {
        navigator.clipboard.writeText(process.env.REACT_APP_BASE_URL + '/user?id=' + id)
        setIsClicked(true)
        setTimeout(() => {
            setIsClicked(false)
        }, 1000)
    }
})

const Error = memo(function Error({ message, parentId }) {
    return (
        <div id = {parentId + 'error'} className = {'w-full overflow-hidden transition-all duration-main -mt-micro ' + (message ? 'max-h-[99px]' : 'max-h-[0px]')}>
            <Text id = {parentId + 'text'} preset = 'profile-error'>
                {message}
            </Text>
        </div>
    )
})

export default Profile