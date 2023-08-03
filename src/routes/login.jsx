import { useUserContext } from '../contexts/user'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import Image from '../components/image'
import Page from '../components/page'
import Map from '../components/map'
import { memo } from 'react'

export default function Login() {
    const { login } = useUserContext()

    let DOMId = 'login'
    return (
        <Page DOMId = {DOMId}>
            <div id = {DOMId} className = 'transition-colors duration-main w-full h-full flex flex-col bg-base-main rounded-main p-main'>
                <Helmet><title>Login • Betsy</title></Helmet>
                <div id = {DOMId + '-bar'} className = 'w-min bg-gradient-to-r from-primary-highlight to-accent-highlight bg-clip-text py-micro'>
                    <Text id = {DOMId + '-title'} preset = 'login-title' classes = '!text-transparent'>
                        Betsy
                    </Text>
                </div>
                <div id = {DOMId + '-blurbs'} className = 'flex flex-col'>
                    <Map items = {blurbs} callback = {(blurb, index) => { 
                        let blurbId = DOMId + '-blurb' + index; return (
                        <Blurb key = {index} subtitle = {blurb.subtitle} body = {blurb.body} parentId = {blurbId}/>
                    )}}/>
                </div>
                <div id = {DOMId + 'form'} className = 'w-full h-min flex flex-col items-center gap-small'>
                <Map items = {options} callback = {(option, index) => { 
                    let optionId = DOMId + '-option' + index; return (
                    <Option key = {index} source = {option.source} image = {option.image} login = {login} parentId = {optionId}/>
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

const Blurb = memo(function Blurb({ subtitle, body, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'w-full flex flex-col'>
            <Text id = {DOMId + '-subtitle'} preset = 'login-subtitle'>
                {subtitle}
            </Text>
            <Text id = {DOMId + '-title'} preset = 'login-body'>
                {body}
            </Text>
        </div>
    )
})

const Option = memo(function Option({ source, image, login, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'transition-colors duration-main w-full h-min flex justify-center items-center gap-small p-small bg-base-main hover:bg-base-highlight rounded-main border-thin border-divider-main shadow-sm md:shadow cursor-pointer' onClick = {() => login(source)}>
            <Text id = {DOMId + '-sign-in-text'} preset = 'login-option'>
                Sign in with
            </Text>
            <Image id = {DOMId + '-image'} path = {image} classes = 'h-full aspect-square'/>
        </div>
    )
}, (b, a) => b.source === a.source && b.image === a.image)

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