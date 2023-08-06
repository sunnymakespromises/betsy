import { memo } from 'react'

const Page = memo(function Page({ canScroll = false, children, DOMId }) {
    return (
        <div id = {DOMId + '-page'} className = {'absolute transition-all duration-main w-full flex flex-col p-base md:p-lg pt-0 md:pt-lg md:pl-0 overflow-y-auto no-scrollbar !animate-duration-700 ' + (canScroll ? 'min-h-full h-full max-h-full flex' : 'md:overflow-hidden h-full')}>
            {children}
        </div>
    )
})

export default Page