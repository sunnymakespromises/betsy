import { useState, useEffect } from 'react'

function useInput(list, initial = null) {
    const [input, setInput] = useState()
    const simpleInput = !(list)

    function initializeInput() {
        if (simpleInput) {
            setInput(initial ? initial : '')
        }
        else {
            const target = {}
            if (initial) {
                for (let i = 0; i < list.length; i++) {
                    target[list[i]] = initial[i]
                }
            }
            else {
                list.forEach(key => target[key] = '')
            }
            setInput(target)
        }
    }

    useEffect(() => {
        if (!input) {
            initializeInput()
        }
    }, [])

    const onInputChange = (category, value, type) => {
        if (simpleInput) {
            setInput(type === 'text' ? value : value ? URL.createObjectURL(value) : null)
        }
        else {
            if (type === 'text') {
                let newInput = input
                newInput[category] = value
                setInput({...newInput})
            }
            else {
                if (value) {
                    let newInput = input
                    newInput[category] = URL.createObjectURL(value)
                    setInput({...newInput})
                }
            }
        }
    }

    function clearInput(input) {
        if (simpleInput) {
            initializeInput()
        }
        else {
            let newInput = input
            newInput[input] = initial ? initial[list.indexOf(input)] : ''
            setInput({...newInput})
        }
    }

    function clearAllInput() {
        initializeInput()
    }

    return { input, clearInput, clearAllInput, onInputChange }
}

export { useInput }