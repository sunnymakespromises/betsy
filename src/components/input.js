import _ from 'lodash'
import { forwardRef, memo, useMemo } from 'react'
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
const Input = memo(forwardRef(function Input({ value, status, type = 'text', preset = 'main', styles, classes, onChange, ...extras }, ref) {
    let options = {
        main: {
            classes: 'font-main w-min text-base-0 text-3xl bg-black bg-opacity-30 focus:outline-none px-3 py-2 rounded-xl',
            true: '',
            false: '',
            null: ''
        },
        profile: {
            display_name: {
                classes: 'transition-all duration-main select-none w-full font-main font-bold text-xl md:text-xl text-primary-main placeholder:text-text-main/killed bg-transparent focus:outline-none',
                true: '',
                false: 'text-red-0',
                null: ''
            },
            username: {
                classes: 'transition-all duration-main select-none w-full font-main font-medium text-sm md:text-base text-primary-main placeholder:text-text-main/killed bg-transparent focus:outline-none',
                true: '',
                false: 'text-red-0',
                null: ''
            },
            bio: {
                classes: 'transition-all duration-main select-none w-full font-main font-light text-sm md:text-base text-primary-main placeholder:text-text-main/killed bg-transparent focus:outline-none',
                true: '',
                false: 'text-red-0',
                null: ''
            }
        },
        search: {
            classes: 'transition-all duration-main px-main p-small font-main font-medium w-full text-2xl md:text-lg text-text-main placeholder:text-text-main/killed focus:outline-none bg-base-highlight z-10',
            true: '',
            false: '',
            null: ''
        },
        dev: {
            images: {
                classes: 'transition-all duration-main px-main p-small font-main font-medium w-full text-2xl md:text-lg text-text-main placeholder:text-text-main/killed focus:outline-none bg-base-highlight z-10 rounded-main',
                true: '',
                false: '',
                null: ''
            }
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
        <input className = {option.classes + (status === false ? ' ' + option.false : '') + (status === true ? ' ' + option.true : '') + (status === null ? ' ' + option.null : '') + (classes ? ' ' + classes : '')} style = {styles} value = {value ? value : ''} type = {type} onChange = {onChange} ref = {ref} {...extras}/>
    )
}), (b, a) => b.value === a.value && _.isEqual(b.status, a.status) && b.type === a.type && b.preset === a.preset && _.isEqual(b.styles, a.styles) && b.classes === a.classes)

export default Input