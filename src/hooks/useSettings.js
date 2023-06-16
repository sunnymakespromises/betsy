import { useEffect } from 'react'
import { useWindowContext } from '../contexts/window'
import { useInput } from './useInput'

function useSettings(list, defaults) {
    const { cookies, setCookie } = useWindowContext()
    const { input, onInputChange } = useInput(list, getDefaults())

    useEffect(() => {
        for (let i = 0; i < list.length; i++) {
            if (cookies[list[i]] === undefined) {
                setCookie(list[i], defaults[i])
            }
        }
    }, [])

    function getDefaults() {
        let newDefaults = []
        for (let i = 0; i < list.length; i++) {
            console.log(cookies[list[i]])
            newDefaults[i] = cookies[list[i]] ? cookies[list[i]] : defaults[i]
        }
        return newDefaults
    }

    function _onInputChange(category, value, type) {
        onInputChange(category, value, type)
        setCookie(category, value)
    }

    return [input, _onInputChange]
}

export { useSettings }