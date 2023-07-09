import { memo } from 'react'

const Page = memo(function Page({ canScroll = false, children }) {
    return (
        <div className = {'page absolute w-full p-main overflow-auto no-scrollbar md:overflow-hidden bg-base-main !animate-duration-300' + (canScroll ? '' : ' h-full')}>
            {children}
        </div>
    )
}, (b, a) => b.children === a.children)

export default Page