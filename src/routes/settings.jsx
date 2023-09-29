import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import { Helmet } from 'react-helmet'
import { CheckLg, CurrencyExchange, GearFill, GeoAltFill, PaletteFill, PersonFill } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useUserContext } from '../contexts/user'
import { useSetting } from '../hooks/useSetting'
import { useInput } from '../hooks/useInput'
import { useDatabase } from '../hooks/useDatabase'
import { useCropper } from '../hooks/useCropper'
import { useStatuses } from '../hooks/useStatuses'
import Text from '../components/text'
import Page from '../components/page'
import Map from '../components/map'
import Input from '../components/input'
import Conditional from '../components/conditional'
import Image from '../components/image'
import { MultiPanel } from '../components/panel'
import Error from '../components/error'

const Settings = memo(function Settings() {
    let DOMId = 'settings'
    let panelsConfig = [
        {
            category: 'panel',
            key: 'settings',
            icon: GearFill,
            panelClasses: null,
            parentId: DOMId + '-settings',
            children: <SettingsPanel parentId = {DOMId}/>
        },
        {
            category: 'panel',
            key: 'account',
            icon: PersonFill,
            panelClasses: null,
            parentId: DOMId + '-account',
            children: <AccountPanel parentId = {DOMId}/>
        }
    ]

    return (
        <Page DOMId = {DOMId}>
            <Helmet><title>Settings • Betsy</title></Helmet>
            <div id = {DOMId} className = 'relative w-full h-full flex flex-col gap-base md:gap-lg'>
                <div id = {DOMId + '-body'} className = 'w-full h-full flex flex-col md:flex-row grow gap-base md:gap-lg'>
                    <MultiPanel config = {panelsConfig} parentId = {DOMId}/>
                </div>
            </div>
        </Page>
    )
})

const AccountPanel = memo(function AccountPanel({ parentId }) {
    const { currentUser } = useUserContext()
    const accountInfo = [
        {
            title: 'Display Name',
            icon: (props) => <PersonFill {...props}/>,
            key: 'display_name',
        }
    ]
    const { statuses, setStatuses } = useStatuses(['display_name', 'picture'])
    const { input, inputIsEmpty, onInputChange, isThisInputEmpty, clearAllInput } = useInput(['display_name', 'picture'])
    const [pictureParams, onCrop] = useCropper(input.picture)


    let DOMId = parentId + '-account'
    return currentUser && (
        <div id = {DOMId} className = 'flex flex-col gap-base'>
            <div id = {DOMId + '-info'} className = 'flex gap-sm'>
                <Picture params = {pictureParams} picture = {currentUser.picture} input = {input.picture} onInputChange = {onInputChange} isThisInputEmpty = {isThisInputEmpty} status = {statuses.picture} parentId = {DOMId}/>
                <div id = {DOMId + '-items'} className = 'grow flex flex-col gap-sm'>
                    <Map items = {accountInfo} callback = {(info, index) => {
                        let infoId = DOMId + '-info' + index; return (
                        <React.Fragment key = {index}>
                            <Info category = {info.key} value = {currentUser[info.key]} icon = {info.icon} input = {input[info.key]} onInputChange = {onInputChange} status = {statuses[info.key]} isThisInputEmpty = {isThisInputEmpty} parentId = {infoId}/>
                            <Conditional value = {index !== accountInfo.length - 1}>
                                <div className = 'transition-colors duration-main border-t-sm border-divider-highlight'/>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </div>
                <Save currentUser = {currentUser} onCrop = {onCrop} input = {input} statuses = {statuses} setStatuses = {setStatuses} inputIsEmpty = {inputIsEmpty} clearAllInput = {clearAllInput} parentId = {DOMId}/>
            </div>
            <Logout parentId = {DOMId}/>
        </div>
    )
})

const SettingsPanel = memo(function SettingsPanel({ parentId }) {
    const settings = [
        {
            title: 'Theme',
            icon: (props) => <PaletteFill {...props}/>,
            key: 'theme',
            defaultValue: 'system',
            options: [{title: 'System', value: 'system'}, {title: 'Light', value: 'light'}, {title: 'Dark', value: 'dark'}]
        },
        {
            title: 'Format',
            icon: (props) => <GeoAltFill {...props}/>,
            key: 'odds_format',
            defaultValue: 'american',
            options: [{title: 'American', value: 'american'}, {title: 'Decimal', value: 'decimal'}]
        },
        {
            title: 'Currency',
            icon: (props) => <CurrencyExchange {...props}/>,
            key: 'currency',
            defaultValue: 'dollars',
            options: [{title: 'Dollars', value: 'dollars'}, {title: 'Pounds', value: 'pounds'}, {title: 'Euros', value: 'euros'}]
        }
    ]

    let DOMId = parentId + '-settings'
    return (
        <div id = {DOMId} className = 'flex flex-col gap-sm'>
            <Map items = {settings} callback = {(setting, index) => {
                let settingId = DOMId + '-setting' + index; return (
                <Setting key = {index} title = {setting.title} icon = {setting.icon} settingKey = {setting.key} options = {setting.options} defaultValue = {setting.defaultValue} parentId = {settingId}/>
            )}}/>
        </div>
    )
})

const Setting = memo(function Setting({ title, icon, settingKey, options, defaultValue, parentId }) {
    const Icon = icon
    const [input, onInputChange] = useSetting(settingKey, defaultValue)
    
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'w-full flex justify-between items-center gap-base'>
            <div id = {DOMId + '-name'} className = 'w-min flex items-center gap-xs'>
                <Icon id = {DOMId + '-icon'} className = 'h-4 w-4 text-primary-main'/>
                <Text id = {DOMId + '-title'} preset = 'body' classes = 'text-text-highlight whitespace-nowrap'>
                    {title}
                </Text>
            </div>
            <div id = {DOMId + '-items'} className = 'w-min flex gap-xs'>
                <Map items = {options} callback = {(option, index) => {
                    let optionId = DOMId + '-option' + index; return (
                    <Text key = {index} id = {optionId + '-title'} preset = 'body' classes = {'transition-colors duration-main w-full p-sm rounded-full cursor-pointer ' + (input === option.value ? 'bg-primary-main hover:bg-primary-highlight text-text-primary' : 'bg-base-main/muted hover:bg-base-main text-text-main/killed hover:text-text-main/muted')} onClick = {() => onInputChange(option.value)}>
                        {option.title}
                    </Text>
                )}}/>
            </div>
        </div>
    )
}, (b, a) => b.title === a.title && b.settingKey === a.settingKey && b.defaultValue === a.defaultValue && _.isEqual(b.options, a.options))

const Info = memo(function Info({ category, value, icon, classes, input, onInputChange, status, isThisInputEmpty, parentId }) {
    const thisInputIsEmpty = useMemo(() => isThisInputEmpty(category), [input])
    const Icon = icon

    let DOMId = parentId + '-' + category
    return (
        <div id = {DOMId} className = 'flex items-center gap-xs'>
            <Icon id = {DOMId + '-icon'} className = 'h-4 w-4 text-primary-main'/>
            <div id = {DOMId + '-input'} className = {'w-full flex flex-col' + (status.message ? ' gap-xs' : '') + (classes ? ' ' + classes : '')}>
                <Input id = {DOMId + '-input-input'} preset = 'profile' classes = {'w-full ' + (thisInputIsEmpty ? 'bg-base-main/muted hover:bg-base-main focus:bg-base-main text-text-main/killed placeholder:text-text-main/killed' : 'bg-primary-main text-text-primary')} status = {status.status} value = {input} onChange = {(e) => onChange(e)} placeholder = {value} autoComplete = 'off'/>
                <Error message = {status.message} parentId = {DOMId}/>
            </div>
        </div>
    )

    function onChange(event) {
        onInputChange(category, event.target.value, 'text')
    }
}, (b, a) => b.category === a.category && b.value === a.value && b.classes === a.classes && b.input === a.input && b.isThisInputEmpty === a.isThisInputEmpty && _.isEqual(b.status, a.status))

const Picture = memo(function Picture({ params, picture, input, onInputChange, isThisInputEmpty, status, parentId }) {
    const thisInputIsEmpty = useMemo(() => isThisInputEmpty('picture'), [input])
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)

    useEffect(() => {
        if (!status.status) {
            setIsCropping(false)
        }
    }, [status])

    let DOMId = parentId + '-picture'
    return (
        <div id = {DOMId} className = 'w-min h-min flex justify-center'>
            <input id = {DOMId + '-input'} className = 'hidden' type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Image external id = {DOMId + '-image'} path = {isCropping ? '' : input ? input : picture} classes = {'relative h-16 aspect-square rounded-full border-base border-primary-main overflow-hidden z-10 cursor-pointer' + (thisInputIsEmpty ? '' : ' border-thin border-primary-main')} mode = 'cover' onClick = {() => onPictureClick()}>
                <Conditional value = {isCropping}>
                    <Cropper {...params}/>
                    <Error message = {status.message} parentId = {DOMId}/>
                </Conditional>
            </Image>
        </div>
    )

    function onUpload(event) {
        if (event.target.files[0]) {
            setIsCropping(true)
            onInputChange('picture', event.target.files[0], 'image')
        }
        event.currentTarget.value = null
    }

    function onPictureClick() {
        if (!isCropping) {
            pictureInput.current.click()
        }
    }
}, (b, a) => b.picture === a.picture && b.input === a.input && _.isEqual(b.status, a.status) && _.isEqual(JSON.stringify(b.params), JSON.stringify(a.params)))

const Save = memo(function Save({ currentUser, input, onCrop, statuses, setStatuses, inputIsEmpty, clearAllInput, parentId }) {
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

    let DOMId = parentId + '-save'
    return (
        <div id = {DOMId} className = {'group/save transition-all duration-main h-min py-2xs overflow-hidden cursor-pointer ' + (!inputIsEmpty ? 'max-w-full px-2xs' : 'max-w-0 px-0') + ' !animate-duration-300' + (atLeastOneChangeFailed ? ' animate-headShake' : '')} onClick = {() => onAction()}>
            <CheckLg id = {DOMId + '-icon'} className = {'text-2xl text-primary-main group-hover/save:text-primary-highlight'}/>
        </div>
    )

    async function onAction() {
        if (!inputIsEmpty) {
            let promises = []
            for (const i of Object.keys(changes)) {
                promises.push(updateProfile(i, i === 'picture' ? URL.createObjectURL(await onCrop([254, 254])) : input[i]))
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
        }
    }
}, (b, a) => b.inputIsEmpty === a.inputIsEmpty && _.isEqual(b.currentUser, a.currentUser) && _.isEqual(b.input, a.input) && _.isEqual(b.statuses, a.statuses))

const Logout = memo(function Logout({ parentId }) {
    let DOMId = parentId + '-logout'
    return (
        <Link to = '/logout' id = {DOMId} className = 'transition-colors duration-main w-[50%] p-sm self-center bg-primary-main hover:bg-primary-highlight rounded-base cursor-pointer'>
            <Text id = {DOMId + '-text'} preset = 'body' classes = 'text-text-primary text-center'>
                Logout
            </Text>
        </Link>
    )
})

// const Footer = memo(function Footer({ parentId }) {
//     let DOMId = parentId + '-donate'
//     return (
//         <div id = {DOMId} className = 'w-full flex flex-col justify-end items-center grow gap-tiny'>
//             <Text id = {DOMId + '-text'} preset = 'subtitle' classes = 'text-text-main/muted text-center w-full'>
//                 Betsy is 100% free to use so I pay everything out of pocket for servers and APIs. This can cost a lot, especially as the site grows. If you enjoy playing and want to support the project, you can donate using&nbsp;
//                 <Link id = {DOMId + '-link'} to = 'https://bmc.link/sunnynineteen' className = 'text-primary-main'>
//                     this link
//                 </Link>
//                 .&nbsp;Powered by&nbsp;
//                 <Link id = {DOMId + '-link1-link'} to = 'https://the-odds-api.com' className = 'text-primary-main'>
//                     The Odds API
//                 </Link>
//                 &nbsp;and&nbsp;
//                 <Link id = {DOMId + '-link2-link'} to = 'https://fanduel.com/' className = 'text-primary-main'>
//                     Fanduel
//                 </Link>
//             </Text>
//         </div>
//     )
// })

export default Settings