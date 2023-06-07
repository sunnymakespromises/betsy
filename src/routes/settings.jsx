import Button from '../components/button'
import Image from '../components/image'
import Text from '../components/text'
import { useRootContext } from '../contexts/root'
import { Helmet } from 'react-helmet'

export default function Settings() {
    const { currentUser, signout } = useRootContext()

    return (
        <div className = 'w-full h-full flex flex-col items-center gap-4'>
            <Helmet><title>settings | betsy</title></Helmet>
            <Image external id = 'profile-picture' path = {currentUser ? currentUser.picture : ''} classes = 'h-48 aspect-square rounded-full shadow-main' mode = 'cover'/>
            <Button classes = 'w-min' onClick = {() => signout()}>
                <Text preset = 'button' classes = '!text-lg md:!text-2xl'>
                    sign out
                </Text>
            </Button>
        </div>
    )
}