import _ from 'lodash'
import { useState, useRef, useMemo, useCallback } from 'react'

function useInput(list, initial = null) {
    const simpleInput = !(list)
    const [input, setInput] = useState(getEmptyInput())
    const inputRef = useRef()
    inputRef.current = input
    const inputIsEmpty = useMemo(() => _.isEqual(input, getEmptyInput()), [input])

    function getEmptyInput() {
        let empty
        if (simpleInput) {
            empty = initial ? initial : ''
        }
        else {
            empty = {}
            if (initial) {
                for (let i = 0; i < list.length; i++) {
                    empty[list[i]] = initial[i]
                }
            }
            else {
                list.forEach(key => empty[key] = '')
            }
        }
        return empty
    }

    function onInputChange(category, value, type) {
        if (simpleInput) {
            setInput(type === 'text' ? value : value ? URL.createObjectURL(value) : null)
        }
        else {
            if (type === 'text') {
                let newInput = {...inputRef.current}
                newInput[category] = value
                setInput(newInput)
            }
            else {
                if (value) {
                    let newInput = {...inputRef.current}
                    newInput[category] = URL.createObjectURL(value)
                    setInput(newInput)
                }
            }
        }
    }

    const isThisInputEmpty = useCallback(function isThisInputEmpty(category) {
        return initial ? input[category] === initial[category] : input[category] === ''
    }, [input])

    function clearInput(input) {
        if (simpleInput) {
            setInput(getEmptyInput())
        }
        else {
            let newInput = input
            newInput[input] = initial ? initial[list.indexOf(input)] : ''
            setInput({...newInput})
        }
    }

    function clearAllInput() {
        setInput(getEmptyInput())
    }

    return { input: inputRef.current, onInputChange, clearInput, clearAllInput, inputIsEmpty, isThisInputEmpty }
}

export { useInput }