import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'
import Divider from '../components/divider'


export default function Login() {
    const { sm, login, isDarkMode } = useRootContext()

    return (
        <div id = 'login-page' className = 'flex flex-col gap-6'>
            <Helmet>
                <title>login | betsy</title>
            </Helmet>
            <div id = 'login-intro' className = 'w-min h-min flex flex-col items-center'>
                <Image path = {'images/' + (isDarkMode ? 'dark' : 'light') + '/logo.svg'} classes = 'w-48 md:w-60 aspect-[2.4]'/>
                <Text classes = '!text-sm md:!text-lg text-center'>
                    the free sports betting app for casual fans.
                </Text>
            </div>
            <div className='w-full border-thin border-reverse-0 border-opacity-5 dark:border-opacity-10 rounded-full'/>
            <div id = 'login-form' className = 'w-full h-min flex flex-col items-center gap-2'>
                <Button classes = 'h-16 w-16 md:w-full' onClick = {() => login()}>
                    <Image path = 'images/google-logo.svg' classes = 'h-full aspect-square'/>
                </Button>
            </div>
        </div>
    )
}