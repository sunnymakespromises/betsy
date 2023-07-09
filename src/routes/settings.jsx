import React, { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { useSetting } from '../hooks/useSetting'
import Text from '../components/text'
import Page from '../components/page'
import Map from '../components/map'
import Button from '../components/button'
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
    let DOMId = 'settings-'
    return (
        <Page>
            <div id = {DOMId + 'page'} className = 'relative w-full h-full flex flex-col gap-tiny md:gap-smaller'>
                <Helmet><title>Settings | Betsy</title></Helmet>
                <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col md:flex-row gap-main md:gap-main'>
                    <div id = {DOMId + 'account-container'} className = 'w-full md:w-min h-min md:h-full flex flex-col rounded-main border-divider-main border-thin md:shadow'>
                        <Text id = {DOMId + 'account-title'} preset = 'settings-title' classes = 'p-main'>
                            Account
                        </Text>
                        <div className = 'divider border-t-thin border-divider-main'/>
                        <div id = {DOMId + 'account'} className = 'w-full h-full flex flex-col p-main'>
                            <Profile parentId = {DOMId} classes = 'rounded-b-none border-b-0'/>
                            <Logout parentId = {DOMId}/>
                        </div>
                    </div>
                    <div id = {DOMId + 'settings-container'} className = 'w-full h-full flex flex-col rounded-main border-divider-main border-thin md:shadow'>
                        <Text id = {DOMId + 'settings-title'} preset = 'settings-title' classes = 'p-main'>
                            Settings
                        </Text>
                        <div className = 'divider border-t-thin border-divider-main'/>
                        <div id = {DOMId + 'settings'} className = 'w-full h-full flex flex-col p-main gap-small'>
                            <Map array = {settings} callback = {(setting, index) => {
                                let settingId = DOMId + index + '-'; return (
                                <Setting key = {index} title = {setting.title} inputKey = {setting.key} options = {setting.options} defaultValue = {setting.defaultValue} parentId = {settingId}/>
                            )}}/>
                        </div>
                    </div>
                </div>
                <Donate/>
                <Footer/>
            </div>
        </Page>
    )
})

const Setting = memo(function Setting({ title, inputKey, options, defaultValue, parentId }) {
    let [isExpanded, setIsExpanded] = useState(false)
    const cancelRef = useCancelDetector(() => isExpanded ? setIsExpanded(false) : null)
    const [input, onInputChange] = useSetting(inputKey, defaultValue)
    let DOMId = parentId + 'setting-' + inputKey + '-'
    return (
        <div ref = {cancelRef} id = {DOMId + 'container'} className = {'w-full flex flex-row justify-between items-center ' + (isExpanded ? 'z-10' : 'z-0')}>
            <Text id = {DOMId + 'title'} preset = 'settings-setting-title'>
                {title}
            </Text>
            <div id = {DOMId + 'options-container'} className = 'relative w-min h-min'>
                <div id = {DOMId + 'value'} className = {'w-full flex flex-row items-center border-thin border-divider-main md:shadow-sm cursor-pointer py-tiny px-smaller rounded-small'} onClick = {() => onClick()}>
                    <Text preset = 'settings-setting-option-title' classes = '!text-text-main'>
                        {options.find(option => option.value === input)?.title}
                    </Text>
                    <ExpandMoreRounded className = {'!w-5 !h-5 text-primary-main ' + (isExpanded ? 'rotate-180' : 'rotate-0')}/>
                </div>
                <div id = {DOMId + 'options'} className = {'absolute top-full right-0 w-min flex flex-col mt-small overflow-hidden h-min bg-base-main py-tiny px-smaller rounded-small border-thin border-divider-main md:shadow' + (!isExpanded ? ' hidden' : '')}>
                    <Map array = {options} callback = {(option, index) => {
                        let optionId = DOMId + option.value + '-'; return (
                        <div key = {index} id = {optionId + 'container'} className = 'group/option w-full h-min flex flex-row items-center gap-small cursor-pointer' onClick = {() => onInputChange(option.value)}>
                            <Text id = {optionId + 'title'} preset = 'settings-setting-option-title'>
                                {option.title}
                            </Text>
                            <Conditional value = {option.value === input}>
                                <CheckRounded className = {'!w-4 !h-4 text-primary-main'}/>
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
}, (b, a) => _.isEqual(b.options, a.options))

const Donate = memo(function Donate() {
    return (
        <div id = 'donate-container' className = 'w-full flex flex-col items-center grow gap-tiny'>
            <Text preset = 'settings-donate-body' classes = 'w-full md:w-[50%]'>
                Betsy is 100% free to use so I pay everything out of pocket for servers and APIs. This can cost a lot, especially as the site grows. If you enjoy playing and want to support the project, you can donate using&nbsp;
                <Link to = 'https://bmc.link/sunnynineteen' className = 'text-primary-main'>
                    this link
                </Link>.
            </Text>
        </div>
    )
})

const Footer = memo(function Footer() {
    return (
        <div id = 'footer-container' className = 'relative md:absolute w-full md:w-min flex flex-row justify-center md:justify-end bottom-0 right-0'>
            <div id = 'footer-powered-by-container' className = 'flex flex-row items-baseline gap-micro'>
                <Text preset = 'settings-footer-body'>Powered by</Text>
                <Link to = 'https://the-odds-api.com'>
                    <Text preset = 'settings-footer-link' classes = 'cursor-pointer'>
                        The Odds API
                    </Text>
                </Link>
                <Text preset = 'settings-footer-body'>and</Text>
                <Link to = 'https://fanduel.com/'>
                    <Text preset = 'settings-footer-link' classes = 'cursor-pointer'>
                        Fanduel
                    </Text>
                </Link>
            </div>
        </div>
    )
})

const Logout = memo(function Logout({ parentId }) {
    let DOMId = parentId + 'logout-'
    return (
        <Link to = '/logout' className = 'relative z-10'>
            <Button preset = 'logout' id = {DOMId + 'button'} classes = 'group/logout'>
                <Text id = {DOMId + 'text'} preset = 'settings-logout'>
                    Sign Out
                </Text>
            </Button>
        </Link>
    )
})

export default Settings