import { memo } from 'react'
import { Helmet } from 'react-helmet'
import { useUserContext } from '../contexts/user'
import Text from '../components/text'
import Image from '../components/image'
import Page from '../components/page'
import Map from '../components/map'

export default function Login() {
    let DOMId = 'login'
    const { login } = useUserContext()

    return (
        <Page DOMId = {DOMId}>
            <div id = {DOMId} className = 'transition-colors duration-main w-full h-full flex flex-col justify-center items-center p-base md:p-lg'>
                <div id = {DOMId + '-container'} className = 'w-[50%] h-min flex flex-col items-center gap-base md:gap-lg'>
                    <Helmet><title>Login • Betsy</title></Helmet>
                    <div id = {DOMId + '-title'} className = 'w-min flex flex-col'>
                        <Text id = {DOMId + '-title-text'} preset = 'title' classes = 'w-full text-center !text-7xl !font-black text-primary-main'>
                            Betsy
                        </Text>
                        <Text id = {DOMId + '-subtitle'} preset = 'body' classes = '!font-bold text-primary-main/muted'>
                            The first free betting simulator!
                        </Text>
                        <div id = {DOMId + '-form'} className = 'w-full h-min flex flex-col gap-sm mt-base'>
                            <Map items = {options} callback = {(option, index) => { 
                                let optionId = DOMId + '-option' + index; return (
                                <Option key = {index} source = {option.source} image = {option.image} title = {option.title} login = {login} parentId = {optionId}/>
                            )}}/>
                        </div>
                    </div>
                    {/* <div id = {DOMId + '-blurbs'} className = 'w-full flex flex-col gap-base'>
                        <Map items = {blurbs} callback = {(blurb, index) => { 
                            let blurbId = DOMId + '-blurb' + index; return (
                            <Blurb key = {index} subtitle = {blurb.subtitle} body = {blurb.body} parentId = {blurbId}/>
                        )}}/>
                    </div> */}
                    
                </div>
            </div>
        </Page>
    )
}

// const Blurb = memo(function Blurb({ subtitle, body, parentId }) {
//     let DOMId = parentId

//     return (
//         <div id = {DOMId} className = 'w-full flex flex-col'>
//             <Text id = {DOMId + '-subtitle'} preset = 'title' classes = '!font-bold text-text-main'>
//                 {subtitle}
//             </Text>
//             <Text id = {DOMId + '-title'} preset = 'body' classes = 'text-text-main'>
//                 {body}
//             </Text>
//         </div>
//     )
// })

const Option = memo(function Option({ source, image, login, title, parentId }) {
    let DOMId = parentId
    
    return (
        <div id = {DOMId} className = 'transition-colors duration-main w-full h-min flex justify-center items-center gap-sm p-base bg-primary-main hover:bg-primary-highlight rounded-base shadow cursor-pointer' onClick = {() => login(source)}>
            <Text id = {DOMId + '-sign-in-text'} preset = 'body' classes = 'text-text-primary'>
                Sign in with {title}
            </Text>
            <Image id = {DOMId + '-image'} path = {image} classes = 'h-full aspect-square'/>
        </div>
    )
}, (b, a) => b.source === a.source && b.image === a.image && b.title === a.title)

// const blurbs = [
//     {
//         subtitle: 'No Risk. All Reward.',
//         body: 'Betsy is 100% free, using fake currency to simulate real bets.',
//         image: null
//     },
//     {
//         subtitle: 'No Risk. All Reward.',
//         body: 'Betsy is 100% free, using fake currency to simulate real bets.',
//         image: null
//     },
//     {
//         subtitle: 'Real Lines. Real Time.',
//         body: 'With odds being updated every 15 minutes, Betsy provides live updates on your favorite sporting events.',
//         image: null
//     }
// ]

const options = [
    {
        source: 'google',
        title: 'Google',
        image: 'images/google-logo.svg'
    }
]