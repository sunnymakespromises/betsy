import { useUserContext } from '../contexts/user'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'
import Page from '../components/page'
import Map from '../components/map'

export default function Login() {
    const { login } = useUserContext()

    let DOMId = 'login-'
    return (
        <Page>
            <div id = {DOMId + 'page'} className = 'w-full h-full flex flex-col bg-base-highlight rounded-main p-main'>
                <Helmet><title>Login | Betsy</title></Helmet>
                <div id = {DOMId + 'title-container'} className = 'w-min bg-gradient-to-r from-primary-highlight to-accent-highlight bg-clip-text py-micro'>
                    <Text id = {DOMId + 'title'} preset = 'login-title' classes = '!text-transparent'>
                        Betsy
                    </Text>
                </div>
                <div id = {DOMId + 'blurbs-container'} className = 'flex flex-col'>
                    <Map array = {blurbs} callback = {(blurb, index) => { return (
                        <div id = {DOMId + 'body'} key = {index} className = 'w-full flex flex-col'>
                            <Text preset = 'login-subtitle'>
                                {blurb.subtitle}
                            </Text>
                            <Text preset = 'login-body'>
                                {blurb.body}
                            </Text>
                        </div>
                    )}}/>
                </div>
                <div id = {DOMId + 'form'} className = 'w-full h-min flex flex-col items-center gap-small'>
                <Map array = {options} callback = {(option, index) => { return (
                    <Button key = {index} preset = 'login' classes = 'gap-small' onClick = {() => login(option.source)}>
                        <Text preset = 'login-option'>
                            Sign in with
                        </Text>
                        <Image path = {option.image} classes = 'h-full aspect-square'/>
                    </Button>
                )}}/>
                </div>
                {/* <Image path = '/images/login-splash.png' classes = 'grow h-full'/> */}
                {/* <div id = {DOMId + 'intro'} className = 'w-48 h-min flex flex-col items-center'>
                    <Image path = {'images/logo-black.svg'} classes = 'w-36 mb-tiny aspect-[1.16] animate-tada'/>
                    <Text preset = 'login-body'>
                        The #1 free sports betting simulator.
                    </Text>
                </div> */}
            </div>
        </Page>
    )
}

const blurbs = [
    {
        subtitle: 'No Risk. All Reward.',
        body: '100% Free, Fake currency',
        image: null
    },
    {
        subtitle: '[INSERT SUBTITLE]',
        body: '80+ competitions across the world [FINISH]',
        image: null
    },
    {
        subtitle: 'Real Lines. Real Time.',
        body: 'With odds being updated every 15 minutes, Betsy provides live updates [FINISH]',
        image: null
    }
]

const options = [
    {
        source: 'google',
        image: 'images/google-logo.svg'
    }
]