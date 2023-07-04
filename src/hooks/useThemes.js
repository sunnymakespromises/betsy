import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

function useThemes() {
    const [cookies,,] = useCookies(['theme'])
    const setting = cookies['theme']
    const [theme, setTheme] = useState(getCurrentTheme())
    
    useEffect(() => {
        if (setting === 'system') {
            setTheme(getCurrentTheme())
            const mqListener = (e => {
                setTheme(e.matches ? 'dark' : 'light')
            })
            const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
            darkThemeMq.addListener(mqListener)
            return () => darkThemeMq.removeListener(mqListener)
        }
        else {
            setTheme(getCurrentTheme())
        }
    }, [setting])

    function getCurrentTheme() {
        if (setting !== 'system') {
            return setting
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    return theme
}

export { useThemes }