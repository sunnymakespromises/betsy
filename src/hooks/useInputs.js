import { useState, useEffect } from 'react'

function useInputs(list, defaults = null) {
    const [inputs, setInputs] = useState()

    function initializeInputs() {
        const target = {}
        if (defaults) {
            for (let i = 0; i < list.length; i++) {
                target[list[i]] = defaults[i]
            }
        }
        else {
            list.forEach(key => target[key] = '')
        }
        setInputs(target)
    }

    useEffect(() => {
        if (!inputs) {
            initializeInputs()
        }
    }, [])

    const onInputChange = (category, value, type = 'text') => {
        if (type === 'image') {
            if (value) {
                let newInputs = inputs
                newInputs[category] = URL.createObjectURL(value)
                setInputs({...newInputs})
            }
        }
        else {
            let newInputs = inputs
            newInputs[category] = value
            setInputs({...newInputs})
        }
    }

    function clearInput(input) {
        let newInputs = inputs
        newInputs[input] = defaults ? defaults[list.indexOf(input)] : ''
        setInputs({...newInputs})
    }

    function clearAllInputs() {
        initializeInputs()
    }

    return { inputs, clearInput, clearAllInputs, onInputChange }
}

export { useInputs }