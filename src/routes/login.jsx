import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'
import { useGoogleLogin } from '@react-oauth/google'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'
import getRefreshToken from '../lib/getRefreshToken'


export default function Login() {
    const { sm, setCookie, setRefreshToken, user, navigate } = useRootContext()
    const login = useGoogleLogin({
        onSuccess: (res) => {
            getRefreshToken(res.code, setRefreshToken, setCookie)
        },
        onError: (err) => console.log('Login Failed:', err),
        flow: 'auth-code',
        accessType: 'offline'
    })

    if (!user) {
        return (
            <div id = 'login-page' className = 'w-full h-full flex flex-col items-center justify-center'>
                <Helmet>
                    <title>login | betsy</title>
                </Helmet>
                <div id = 'login-container' className = 'h-min w-min rounded-main dark:backdrop-brightness-light backdrop-brightness-dark flex flex-col items-center gap-4 p-8'>
                    <Text preset = 'login-title'>
                        login with
                    </Text>
                    <Button classes = 'h-16 w-16 md:w-full' onClick = {() => login()}>
                        {!sm ? (
                        <Text preset = 'button' classes = 'md:justify-between'>
                            google
                        </Text>
                        ):null}
                        <Image path = 'images/google-logo.svg' classes = 'h-full aspect-square'/>
                    </Button>
                </div>
            </div>
        )
    }
    else {
        navigate('/home')
    }
}