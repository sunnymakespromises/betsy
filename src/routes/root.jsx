import { Outlet } from 'react-router-dom'
import { RootProvider as Provider } from '../contexts/root'
import { useBreakpoints } from '../hooks/useBreakpoints'
import { useTheme } from '../hooks/useTheme'

export default function Root() {
    const [sm, md, lg] = useBreakpoints()
    const isDarkMode = useTheme()
    const context = { sm, md, lg, isDarkMode }

    return (
        <Provider value = {context}>
            <div id = 'container' className = 'w-full h-full flex flex-col justify-center items-center'>
                <div id = 'body' className = 'w-[90%] h-[90%]'>
                    <Outlet/>
                </div>
            </div>
        </Provider>
    )
}