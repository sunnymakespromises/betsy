import { useEffect } from 'react'
import { useWindowContext } from '../contexts/window'
import { useInputs } from './useInputs'

function useSettings(list, defaults) {
    const { cookies, setCookie } = useWindowContext()
    const { inputs, onInputChange } = useInputs(list, getDefaults())

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
            newDefaults[i] = cookies[list[i]] ? cookies[list[i]] : defaults[i]
        }
        return newDefaults
    }

    function _onInputChange(category, value, type = 'text') {
        onInputChange(category, value, type)
        setCookie(category, value)
    }

    return [inputs, _onInputChange]
}

export { useSettings }