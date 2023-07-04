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
import { ExpandMoreRounded } from '@mui/icons-material'
import { useCancelDetector } from '../hooks/useCancelDetector'
const settings = [
    {
        title: 'Theme',
        key: 'theme',
        defaultValue: 'system',
        options: [{title: 'System', value: 'system'}, {title: 'Light', value: 'light'}, {title: 'Dark', value: 'dark'}]
    },
    {
        title: 'Odds',
        key: 'odds',
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
            <div id = {DOMId + 'page'} className = 'relative w-full h-full flex flex-col gap-tiny md:gap-smaller overflow-hidden'>
                <Helmet><title>Settings | Betsy</title></Helmet>
                <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col md:flex-row-reverse gap-small overflow-y-auto no-scrollbar'>
                    <div id = {DOMId + 'settings-container'} className = 'w-full h-min flex flex-col gap-tiny rounded-main bg-base-highlight p-small'>
                        <Text id = {DOMId + 'settings-title'} preset = 'settings-title'>
                            Settings
                        </Text>
                        <div className = 'divider border-t-thin border-divider-highlight'/>
                        <div id = {DOMId + 'settings'} className = 'w-full h-full flex flex-col gap-tiny py-micro'>
                            <Map array = {settings} callback = {(setting, index) => {
                                let settingId = DOMId + index + '-'; return (
                                <Setting key = {index} title = {setting.title} inputKey = {setting.key} options = {setting.options} defaultValue = {setting.defaultValue} parentId = {settingId}/>
                            )}}/>
                        </div>
                    </div>
                    <div id = {DOMId + 'group-2-container'} className = 'w-full md:w-min h-min md:h-full flex flex-col gap-small'>
                        <Profile parentId = {DOMId}/>
                        <Logout parentId = {DOMId}/>
                    </div>
                </div>
                <Donate/>
                <Footer/>
            </div>
        </Page>
    )
})

const Setting = memo(function Setting({ title, inputKey, options, defaultValue, parentId }) {
    const cancelRef = useCancelDetector(() => isVisible ? setIsVisible(false) : null)
    let [isVisible, setIsVisible] = useState(false)
    const [input, onInputChange] = useSetting(inputKey, defaultValue)
    let DOMId = parentId + 'setting-' + inputKey + '-'
    return (
        <div ref = {cancelRef} id = {DOMId + 'container'} className = {'w-min flex flex-row gap-small ' + (isVisible ? 'z-10' : 'z-0')}>
            <Text id = {DOMId + 'title'} preset = 'settings-setting-title'>
                {title}
            </Text>
            <div id = {DOMId + 'options-container'} className = 'relative w-full h-min'>
                <div id = {DOMId + 'value'} className = {'w-full flex flex-row items-center cursor-pointer border-thin border-divider-highlight px-small ' + (isVisible ? 'rounded-t-main' : 'rounded-main')} onClick = {() => onClick()}>
                    <Text preset = 'settings-setting-option-title'>
                        {options.find(option => option.value === input)?.title}
                    </Text>
                    <ExpandMoreRounded className = {'!transition-all duration-main !w-5 !h-5 text-primary-main ' + (isVisible ? 'rotate-180' : 'rotate-0')}/>
                </div>
                <div id = {DOMId + 'options'} className = {'absolute top-full left-0 w-min min-w-full flex flex-col overflow-hidden ' + (isVisible ? 'h-min border-thin border-t-0 border-divider-highlight px-small py-micro bg-base-highlight rounded-b-main' : 'h-0')}>
                    <Map array = {options} callback = {(option, index) => {
                        let optionId = DOMId + option.value + '-'; return (
                        <div key = {index} id = {optionId + 'container'} className = 'group/option w-full h-min flex flex-row items-center gap-micro cursor-pointer' onClick = {() => onInputChange(option.value)}>
                            <Text id = {optionId + 'title'} preset = 'settings-setting-option-title' classes = {option.value === input ? '!text-primary-main' : ''}>
                                {option.title}
                            </Text>
                        </div>
                    )}}/>
                </div>
            </div>
        </div>
    )

    function onClick() {
        setIsVisible(!isVisible)
    }
}, (b, a) => _.isEqual(b.options, a.options))

const Donate = memo(function Donate() {
    return (
        <div id = 'donate-container' className = 'w-full flex flex-col items-center grow gap-tiny'>
            <Text preset = 'settings-donate-body' classes = 'w-full md:w-[50%]'>
                Betsy is 100% free to use so I pay everything out of pocket for servers and APIs. This can cost a lot, especially as the site grows. If you enjoy playing and want to support the project, you can donate using&nbsp;
                <Link to = 'https://bmc.link/sunnynineteen' className = 'text-primary-main hover:text-primary-highlight'>
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
        <Link to = '/logout'>
            <Button preset = 'logout' id = {DOMId + 'button'} classes = 'group/logout'>
                <Text id = {DOMId + 'text'} preset = 'logout' classes = 'group-hover/logout:text-text-onPrimary'>
                    Sign Out
                </Text>
            </Button>
        </Link>
    )
})

export default Settings