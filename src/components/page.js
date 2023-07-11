import { memo } from 'react'

const Page = memo(function Page({ canScroll = false, children, DOMId }) {
    return (
        <div id = {DOMId + '-page'} className = {'page absolute w-full p-main overflow-auto no-scrollbar md:overflow-hidden bg-base-main !animate-duration-300' + (canScroll ? '' : ' h-full')}>
            {children}
        </div>
    )
})

export default Page