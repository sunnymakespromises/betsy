import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'
import { googleLogout } from '@react-oauth/google'
import Text from '../components/text'
import Image from '../components/image'
import Button from '../components/button'

export default function Settings() {
    const { user, setUser, setRefreshToken, removeCookie } = useRootContext()

    function signout() {
        googleLogout()
        removeCookie('user')
        setUser(null)
        removeCookie('oauth-refresh-token')
        setRefreshToken(null)
    }

    return (
        <div id = 'settings-page' className = 'w-full h-full flex flex-col items-center justify-center gap-4 p-4'>
            <Helmet>
                <title>settings | betsy</title>
            </Helmet>
            <Text classes = 'w-full flex flex-row italic !text-5xl !font-extrabold whitespace-nowrap'>
                settings
            </Text>
            <div id = 'settings-container' className = 'h-full w-full rounded-main dark:backdrop-brightness-light backdrop-brightness-dark flex flex-col gap-4 p-4'>
                <div id = 'settings' className = 'w-full h-full flex flex-col items-center overflow-scroll scroll-smooth gap-2'>
                    <Image path = {user ? user.picture : ''} classes = 'h-48 aspect-square rounded-full'/>
                    <Text classes = 'font-bold'>
                        {user ? user.username : ''}
                    </Text>
                    <div id = 'favorites' className = 'h-min w-full'>

                    </div>
                    <Button classes = 'min-w-[20%]' onClick = {signout}>
                        <Text preset = 'button'>
                            sign out
                        </Text>
                    </Button>
                </div>
            </div>
        </div>
    )
}