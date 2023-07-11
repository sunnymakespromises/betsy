import React, { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { useSetting } from '../hooks/useSetting'
import Text from '../components/text'
import Page from '../components/page'
import Map from '../components/map'
import Profile from '../components/profile'
import { CheckRounded, ExpandMoreRounded } from '@mui/icons-material'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Conditional from '../components/conditional'
const settings = [
    {
        title: 'Theme',
        key: 'theme',
        defaultValue: 'system',
        options: [{title: 'System', value: 'system'}, {title: 'Light', value: 'light'}, {title: 'Dark', value: 'dark'}]
    },
    {
        title: 'Odds',
        key: 'odds_format',
        defaultValue: 'american',
        options: [{title: 'American', value: 'american'}, {title: 'Decimal', value: 'decimal'}, {title: 'Fractional', value: 'fractional'}]
    },
    {
        title: 'Currency',
        key: 'currency',
        defaultValue: 'dollars',
        options: [{title: 'Dollars', value: 'dollars'}, {title: 'Pounds', value: 'pounds'}, {title: 'Euros', value: 'euros'}]
    }
]

const Settings = memo(function Settings() {
    let DOMId = 'settings'
    return (
        <Page DOMId = {DOMId}>
            <div id = {DOMId} className = 'relative w-full h-full flex flex-col gap-tiny md:gap-smaller'>
                <Helmet><title>Settings | Betsy</title></Helmet>
                <div id = {DOMId + '-body'} className = 'w-full h-full flex flex-col md:flex-row gap-main md:gap-main'>
                    <div id = {DOMId + '-account'} className = 'w-full md:w-min h-min md:h-full rounded-main border-divider-main border-thin md:shadow'>
                        <Text id = {DOMId + '-account-title'} preset = 'settings-title' classes = 'p-main'>
                            Account
                        </Text>
                        <div className = 'border-t-thin border-divider-main'/>
                        <div id = {DOMId + '-account-data'} className = 'w-full h-full flex flex-col p-main'>
                            <Profile parentId = {DOMId + '-account'} classes = 'rounded-b-none border-b-0'/>
                            <Logout parentId = {DOMId + '-account'}/>
                        </div>
                    </div>
                    <div id = {DOMId + '-settings'} className = 'w-full h-full flex flex-col rounded-main border-divider-main border-thin md:shadow'>
                        <Text id = {DOMId + '-settings-title'} preset = 'settings-title' classes = 'p-main'>
                            Settings
                        </Text>
                        <div className = 'border-t-thin border-divider-main'/>
                        <div id = {DOMId + '-settings-data'} className = 'w-full h-full flex flex-col p-main gap-small'>
                            <Map array = {settings} callback = {(setting, index) => {
                                let settingId = DOMId + '-settings-setting' + index; return (
                                <Setting key = {index} title = {setting.title} settingKey = {setting.key} options = {setting.options} defaultValue = {setting.defaultValue} parentId = {settingId}/>
                            )}}/>
                        </div>
                    </div>
                </div>
                <Donate parentId = {DOMId}/>
                <Footer parentId = {DOMId}/>
            </div>
        </Page>
    )
})

const Setting = memo(function Setting({ title, settingKey, options, defaultValue, parentId }) {
    let [isExpanded, setIsExpanded] = useState(false)
    const cancelRef = useCancelDetector(() => isExpanded ? setIsExpanded(false) : null)
    const [input, onInputChange] = useSetting(settingKey, defaultValue)
    let DOMId = parentId
    return (
        <div ref = {cancelRef} id = {DOMId} className = {'w-full flex flex-row justify-between items-center ' + (isExpanded ? 'z-10' : 'z-0')}>
            <Text id = {DOMId + '-title'} preset = 'settings-setting-title'>
                {title}
            </Text>
            <div id = {DOMId + '-value'} className = 'relative'>
                <div id = {DOMId + '-current'} className = {'w-full flex flex-row items-center border-thin border-divider-main md:shadow-sm cursor-pointer py-tiny px-smaller rounded-small ' + (isExpanded ? 'bg-base-highlight' : 'hover:bg-base-highlight')} onClick = {() => onClick()}>
                    <Text id = {DOMId + '-current-text'} preset = 'settings-setting-option-title' classes = '!text-text-main'>
                        {options.find(option => option.value === input)?.title}
                    </Text>
                    <ExpandMoreRounded id = {DOMId + '-expand-icon'} className = {'!w-5 !h-5 text-primary-main ' + (isExpanded ? 'rotate-180' : 'rotate-0')}/>
                </div>
                <div id = {DOMId + '-items'} className = {'absolute top-full right-0 w-min flex flex-col mt-small overflow-hidden h-min bg-base-main rounded-small border-thin border-divider-main md:shadow' + (!isExpanded ? ' hidden' : '')}>
                    <Map array = {options} callback = {(option, index) => {
                        let optionId = DOMId + '-option' + index; return (
                        <div key = {index} id = {optionId} className = 'group/option w-full h-min flex flex-row items-center gap-small py-tiny px-smaller hover:bg-base-highlight cursor-pointer' onClick = {() => onInputChange(option.value)}>
                            <Text id = {optionId + '-title'} preset = 'settings-setting-option-title'>
                                {option.title}
                            </Text>
                            <Conditional value = {option.value === input}>
                                <CheckRounded id = {optionId + '-selected-icon'} className = {'!w-4 !h-4 text-primary-main'}/>
                            </Conditional>
                        </div>
                    )}}/>
                </div>
            </div>
        </div>
    )

    function onClick() {
        setIsExpanded(!isExpanded)
    }
}, (b, a) => b.title === a.title && b.settingKey === a.settingKey && b.defaultValue === a.defaultValue && _.isEqual(b.options, a.options))

const Donate = memo(function Donate({ parentId }) {
    let DOMId = parentId + '-donate'
    return (
        <div id = {DOMId} className = 'w-full flex flex-col items-center grow gap-tiny'>
            <Text id = {DOMId + '-text'} preset = 'settings-donate-body' classes = 'w-full md:w-[50%]'>
                Betsy is 100% free to use so I pay everything out of pocket for servers and APIs. This can cost a lot, especially as the site grows. If you enjoy playing and want to support the project, you can donate using&nbsp;
                <Link id = {DOMId + '-link'} to = 'https://bmc.link/sunnynineteen' className = 'text-primary-main'>
                    this link
                </Link>.
            </Text>
        </div>
    )
})

const Footer = memo(function Footer({ parentId }) {
    let DOMId = parentId + '-footer'
    return (
        <div id = {DOMId} className = 'relative md:absolute bottom-0 right-0 w-full md:w-min flex flex-row justify-center md:justify-end gap-tiny'>
            <Text id = {DOMId + '-powered-by'} preset = 'settings-footer-body'>Powered by</Text>
            <Link id = {DOMId + '-link1-link'} to = 'https://the-odds-api.com'>
                <Text id = {DOMId + '-link1-text'} preset = 'settings-footer-link' classes = 'cursor-pointer'>
                    The Odds API
                </Text>
            </Link>
            <Text id = {DOMId + '-link-separator'} preset = 'settings-footer-body'>and</Text>
            <Link id = {DOMId + '-link2-link'} to = 'https://fanduel.com/'>
                <Text id = {DOMId + '-link2-text'} preset = 'settings-footer-link' classes = 'cursor-pointer'>
                    Fanduel
                </Text>
            </Link>
        </div>
    )
})

const Logout = memo(function Logout({ parentId }) {
    let DOMId = parentId + '-logout'
    return (
        <Link to = '/logout' id = {DOMId} className = 'relative z-10'>
            <div id = {DOMId + '-button'} className = 'group/logout relative w-full flex justify-center items-center p-small rounded-b-main cursor-pointer border-thin border-divider-main md:shadow hover:bg-base-highlight'>
                <Text id = {DOMId + '-text'} preset = 'settings-logout'>
                    Sign Out
                </Text>
            </div>
        </Link>
    )
})

export default Settings