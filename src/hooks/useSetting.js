import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useInput } from './useInput'

function useSetting(setting, defaultValue) {
    const [cookies, setCookie,] = useCookies([setting])
    const { input, onInputChange } = useInput(null, getDefaultValue())

    useEffect(() => {
        if (cookies[setting] === undefined) {
            setCookie(setting, defaultValue)
        }
    }, [])

    function getDefaultValue() {
        return cookies[setting] ? cookies[setting] : defaultValue
    }

    function _onInputChange(value) {
        onInputChange(null, value, 'text')
        setCookie(setting, value)
    }

    return [input, _onInputChange]
}

export { useSetting }