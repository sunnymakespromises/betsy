import { memo } from 'react'

const Page = memo(function Page({ canScroll = false, children, DOMId }) {
    return (
        <div id = {DOMId + '-page'} className = {'absolute transition-all duration-main w-full overflow-y-auto no-scrollbar bg-base-main ' + (canScroll ? 'min-h-full h-full max-h-full flex' : 'md:overflow-hidden h-full p-main')}>
            {children}
        </div>
    )
})

export default Page