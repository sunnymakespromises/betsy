import { Helmet } from 'react-helmet'
import Page from '../components/page'
import Text from '../components/text'
import Money from '../components/money'
import { useRootContext } from '../contexts/root'

export default function Wallet() {
    const { currentUser } = useRootContext()
    return (
        <Page>
            <div id = 'wallet-page' className = 'w-full h-full flex flex-col gap-smaller md:gap-main'>
                <Helmet><title>Wallet | Betsy</title></Helmet>
                <div id = 'wallet-amount-container' className = 'w-full h-min flex flex-col animate__animated animate__slideInDown'>
                    <Money id = 'wallet-amount' amount = {currentUser?.balance} textClasses = '!text-7xl md:!text-8xl !font-black w-min text-right'/>
                    <Text id = 'wallet-amount-delta' classes = '!text-base md:!text-lg'>
                        {'+0% over last week'}
                    </Text>
                </div>
                <div className = 'w-full grow backdrop-blur-main rounded-main'>

                </div>
            </div>
        </Page>
    )
}