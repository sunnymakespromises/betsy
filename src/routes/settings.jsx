import { Helmet } from 'react-helmet'
import { useWindowContext } from '../contexts/window'
import { SettingsProvider as Provider, useSettingsContext } from '../contexts/settings'
import Button from '../components/button'
import Image from '../components/image'
import Text from '../components/text'
import Page from '../components/page'
import { useSettings } from '../hooks/useSettings'

export default function Settings() {
    const [inputs, onInputChange] = useSettings(['theme', 'odds-format'], ['System', 'American'])
    const context = { inputs, onInputChange }

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'settings-page' className = 'w-full h-full flex flex-col items-center gap-4'>
                    <Helmet><title>Settings | Betsy</title></Helmet>
                    <Setting title = 'Theme'>
                        <Theme/>
                    </Setting>
                    <Setting title = 'Odds Format'>
                        <OddsFormat/>
                    </Setting>
                </div>
            </Page>
        </Provider>
    )
}

function Setting({title, children}) {
    return (
        <div id = {'settings-setting-' + title + '-container'} className = 'w-full h-min flex flex-col gap-small'>
            <Text>
                {title}
            </Text>
            {children}
        </div>
    )
}

function Theme() {
    const { inputs, onInputChange } = useSettingsContext()
    const options = ['System', 'Light', 'Dark']
    return (
        <div id = 'settings-setting-Theme' className = 'w-min flex flex-col gap-tiny'>
            {options.map((option, index) => {
                return (
                    <div key = {index} id = {'settings-setting-Theme-' + option} className = 'flex items-center gap-small cursor-pointer' onClick = {() => onInputChange('theme', option)}>
                        <div id = {'settings-setting-Theme-' + option + '-selector'} className = {'transition-all duration-main h-[70%] aspect-square bg-reverse-0 dark:bg-base-0 hover:!bg-opacity-100 rounded-full ' + (inputs?.theme === option ? '!bg-opacity-100' : '!bg-opacity-main')}/>
                        <Text id = {'settings-setting-Theme-' + option + '-text'} classes = '!text-2xl md:!text-2xl'>
                            {option}
                        </Text>
                    </div>
                )
            })}
        </div>
    )
}

function OddsFormat() {
    const { inputs, onInputChange } = useSettingsContext()
    const options = ['American', 'Decimal', 'Fractional']
    return (
        <div id = 'settings-setting-Odds-Format' className = 'flex flex-col gap-tiny'>
            {options.map((option, index) => {
                return (
                    <div key = {index} id = {'settings-setting-Odds-Format-' + option} className = 'flex items-center gap-small cursor-pointer' onClick = {() => onInputChange('odds-format', option)}>
                        <div id = {'settings-setting-Odds-Format-' + option + '-selector'} className = {'transition-all duration-main h-[70%] aspect-square bg-reverse-0 dark:bg-base-0 hover:!bg-opacity-100 rounded-full ' + (inputs && inputs['odds-format'] === option ? '!bg-opacity-100' : '!bg-opacity-main')}/>
                        <Text id = {'settings-setting-Odds-Format-' + option + '-text'} classes = '!text-2xl md:!text-2xl'>
                            {option}
                        </Text>
                    </div>
                )
            })}
        </div>
    )
}