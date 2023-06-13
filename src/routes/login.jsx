import { useRootContext } from '../contexts/root'
import { useWindowContext } from '../contexts/window'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'
import Page from '../components/page'


export default function Login() {
    const { isDarkMode } = useWindowContext()
    const { login } = useRootContext()

    return (
        <Page>
            <div id = 'login-page' className = 'w-full h-full flex flex-col items-center justify-center'>
                <Helmet><title>Login | Betsy</title></Helmet>
                <div id = 'login-container' className='w-min h-min flex flex-col gap-4'>
                    <div id = 'login-intro' className = 'w-min h-min flex flex-col items-center'>
                        <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'w-48 md:w-60 aspect-[2.4] animate__animated !animate__slow hover:animate__tada'/>
                        <Text classes = '!text-xl md:!text-3xl !font-black text-center'>
                            Betsy
                        </Text>
                        <Text classes = '!text-sm md:!text-lg text-center'>
                            The #1 free sports betting simulator for casual fans.
                        </Text>
                    </div>
                    <div id = 'login-form' className = 'w-full h-min flex flex-col items-center gap-2'>
                        <Button classes = 'transition-all duration-main h-16 w-16 md:w-full !bg-opacity-100 hover:!bg-opacity-100' onClick = {() => login()}>
                            <Image path = 'images/google-logo.svg' classes = 'h-full aspect-square'/>
                        </Button>
                    </div>
                </div>
            </div>
        </Page>
    )
}