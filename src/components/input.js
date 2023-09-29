import _ from 'lodash'
import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react'
import Conditional from './conditional'
/**
 * An <input> that contains the given value and preset, and updates the value according to onChange when the user types in it.
 * @param {string} value the text value of the input.
 * @param {boolean} status the status (valid, invalid, neither) of the input.
 * @param {string} type the type of input. default is text.
 * @param {string} preset the preset to be applied to the input.
 * @param {object} styles the styles to be passed to the input.
 * @param {string} classes the classes to be passed to the input.
 * @param {function} onChange the function to be triggered whenever the user types into the input.
 * @returns an <input> tag.
 */
const Input = memo(forwardRef(function Input({ value, status, type = 'text', preset = 'main', fitContent = false, styles, classes, placeholder, onChange, ...extras }, ref) {
    const [width, setWidth] = useState(0)
    const span = useRef()

    useEffect(() => {
        if (fitContent) {
            setWidth(span.current.offsetWidth)
        }
    }, [value])

    let options = {
        main: {
            classes: 'transition-all duration-main px-base py-sm font-main font-medium w-full text-base text-text-main bg-base-main/muted hover:bg-base-main focus:bg-base-main rounded-base placeholder:text-text-main/killed focus:outline-none z-10',
            true: '',
            false: '',
            null: ''
        },
        profile: {
            classes: 'transition-all duration-main p-sm select-none font-main font-medium text-base rounded-base focus:outline-none',
            true: '',
            false: '',
            null: ''
        },
        slip_wager: {
            classes: 'transition-all duration-main select-none font-main font-bold text-xl text-text-main/killed text-right bg-transparent placeholder:text-text-main/killed focus:outline-none',
            true: '',
            false: '',
            null: ''
        },
        info: {
            classes: 'transition-all duration-main px-base py-sm font-main font-medium w-full text-base text-text-main bg-base-highlight/muted hover:bg-base-highlight focus:bg-base-highlight rounded-base placeholder:text-text-highlight/killed focus:outline-none z-10',
            true: '',
            false: '',
            null: ''
        },
        search: {
            classes: 'transition-colors duration-main px-main py-smaller font-main font-medium w-full text-sm md:text-sm text-text-main placeholder:text-text-highlight/killed focus:outline-none bg-base-main z-10',
            true: '',
            false: '',
            null: ''
        },
        dev: {
            classes: 'transition-colors duration-main py-small p-main font-main font-medium w-full text-sm md:text-sm text-text-main placeholder:text-text-highlight/killed focus:outline-none bg-base-main z-10',
            true: '',
            false: '',
            null: ''
        },
        events: {
            classes: 'transition-colors duration-main px-main py-smaller font-main font-medium w-full text-sm md:text-sm text-text-main placeholder:text-text-highlight/killed focus:outline-none bg-base-main !border-0 !shadow-none z-10',
            true: '',
            false: '',
            null: ''
        }
    }

    let option = useMemo(() => {
        let presetPath = preset.split('-')
        let option = options[presetPath[0]]
        for (const path of presetPath.slice(1)) {
            option = option[path]
        }
        return option ? option : ''
    }, [preset])

    return (
        <>
            <Conditional value = {fitContent}>
                <span className = {option.classes + ' absolute opacity-0 whitespace-pre -z-1000 pointer-events-none'} ref = {span}>{value !== '' ? value : placeholder}</span>
            </Conditional>
            <input className = {option.classes + (status === false ? ' ' + option.false : '') + (status === true ? ' ' + option.true : '') + (status === null && option.null !== '' ? ' ' + option.null : '') + (classes ? ' ' + classes : '')} style = {{...styles, ...(fitContent ? {width: width} : {})}} value = {value ? value : ''} type = {type} onChange = {onChange} ref = {ref} placeholder = {placeholder} {...extras}/>
        </>
    )
}), (b, a) => b.placeholder === a.placeholder && b.fitContent === a.fitContent && b.value === a.value && b.classes === a.classes && b.type === a.type && b.preset === a.preset && _.isEqual(b.status, a.status) && _.isEqual(b.styles, a.styles))

export default Input