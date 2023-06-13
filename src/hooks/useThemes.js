import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

function useThemes() {
    const [cookies, setCookie, removeCookie] = useCookies(['theme'])
    const setting = cookies['theme']
    const [isDarkMode, setIsDarkMode] = useState(getCurrentTheme())
    
    useEffect(() => {
        console.log(setting)
        if (setting !== 'Light' && setting !== 'Dark') {
            setIsDarkMode(getCurrentTheme())
            const mqListener = (e => {
                setIsDarkMode(e.matches)
            })
            const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')
            darkThemeMq.addListener(mqListener)
            return () => darkThemeMq.removeListener(mqListener)
        }
        else {
            setIsDarkMode(getCurrentTheme())
        }
    }, [setting])

    function getCurrentTheme() {
        switch (setting) {
            case 'Light':
                return false
            case 'Dark':
                return true
            default:
                return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
    }

    return isDarkMode
}

export { useThemes }