import { Helmet } from 'react-helmet'
import { SettingsProvider as Provider, useSettingsContext } from '../contexts/settings'
import Button from '../components/button'
import Text from '../components/text'
import Page from '../components/page'
import { useSettings } from '../hooks/useSettings'
import { Link } from 'react-router-dom'
import Conditional from '../components/conditional'

export default function Settings() {
    const [input, onInputChange] = useSettings(['theme', 'odds_format', 'currency'], ['System', 'American', 'Dollars'])
    const context = { input, onInputChange }

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'settings-page' className = 'w-full h-full flex flex-col items-center gap-smaller'>
                    <Helmet><title>Settings | Betsy</title></Helmet>
                    <Setting title = 'Theme' inputKey = 'theme' options = {['System', 'Light', 'Dark']}/>
                    <Setting title = 'Odds Format' inputKey = 'odds_format' options = {['American', 'Decimal']}/>
                    <Setting title = 'Currency' inputKey = 'currency' options = {['Dollars', 'Pounds', 'Euros']}/>
                    <Donate/>
                    <Footer/>
                </div>
            </Page>
        </Provider>
    )
}

function Setting({title, inputKey, options, children}) {
    const { input, onInputChange } = useSettingsContext()
    return (
        <div id = {'settings-setting-' + title + '-container'} className = 'w-full h-min flex flex-col gap-small'>
            <Text>
                {title}
            </Text>
            <Conditional value = {!children}>
                <div id = {'settings-setting-' + title} className = 'flex flex-col gap-tiny'>
                    {options && options.map((option, index) => {
                        return (
                            <div key = {index} id = {'settings-setting-' + title + '-' + option} className = 'group flex items-center w-min gap-small cursor-pointer' onClick = {() => onInputChange(inputKey, option, 'text')}>
                                <div id = {'settings-setting-' + title + '-' + option + '-selector'} className = {'transition-all duration-main h-[70%] aspect-square bg-reverse-0 dark:bg-base-0 group-hover:!bg-opacity-100 rounded-full ' + (input && input[inputKey] === option ? '!bg-opacity-100' : '!bg-opacity-main')}/>
                                <Text id = {'settings-setting-' + title + '-' + option + '-text'} classes = '!text-2xl md:!text-2xl'>
                                    {option}
                                </Text>
                            </div>
                        )
                    })}
                </div>
            </Conditional>
            {children}
        </div>
    )
}

function Donate() {
    return (
        <div id = 'donate-container' className = 'w-full grow md:w-[80%] flex flex-col justify-end items-center gap-small opacity-main'>
            <Text classes = '!text-sm md:!text-base text-center'>
                Betsy is 100% free to use (and I dont wanna put ads) so i pay everything out of pocket for servers and apis. Needless to say, this can cost a lot, especially as the site grows. If you enjoy playing and want to support me, you can donate using the button below! Any little gift is extremely appreciated, but never feel obligated to give.
            </Text>
            <Link to = 'https://bmc.link/sunnynineteen'>
                <Button classes = 'w-min'>
                    <Text preset = 'button' classes = '!text-base md:!text-xl'>
                        Donate
                    </Text>
                </Button>
            </Link>
        </div>
    )
}

function Footer() {
    return (
        <div id = 'footer-container' className = 'w-full flex flex-row items-center opacity-more-visible'>
            <div id = 'footer-powered-by-container' className = 'grow flex flex-row justify-center items-baseline gap-tiny'>
                <Text classes = '!text-sm md:!text-base text-center'>Powered by</Text>
                <Link to = 'https://the-odds-api.com'>
                    <Text classes = '!text-lg md:!text-xl'>
                        The Odds API
                    </Text>
                </Link>
                <Text classes = '!text-sm md:!text-base text-center'>and</Text>
                <Link to = 'https://fanduel.com/'>
                    <Text classes = '!text-lg md:!text-xl'>
                        Fanduel
                    </Text>
                </Link>
            </div>
        </div>
    )
}