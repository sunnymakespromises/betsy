import { memo } from 'react'

const Page = memo(function Page({ children }) {
    return (
        <div className = 'page absolute w-full h-full p-smaller md:p-main bg-base-main overflow-hidden animate-duration-300 shadow-shadow/5 shadow-main'>
            {children}
        </div>
    )
}, (b, a) => b.children === a.children)

export default Page