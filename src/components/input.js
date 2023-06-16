import { forwardRef } from 'react'
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
const Input = forwardRef(function Input({ value, status, type = 'text', preset = 'main', styles, classes, onChange, ...extras }, ref) {
    let options = {
        'main': {
            classes: 'font-main w-min text-base-0 text-3xl bg-black bg-opacity-30 focus:outline-none px-3 py-2 rounded-xl',
            true: '',
            false: '',
            null: ''
        },
        'profile': {
            classes: 'text-ellipsis overflow-hidden text-center font-main font-black w-full text-reverse-0 dark:text-base-0 text-3xl md:text-3xl placeholder:opacity-main placeholder:text-reverse-0 placeholder:dark:text-base-0 bg-transparent focus:outline-none',
            true: '',
            false: '',
            null: ''
        },
        'search': {
            classes: 'text-ellipsis overflow-hidden font-main font-bold w-full text-reverse-0 dark:text-base-0 text-4xl md:text-5xl placeholder:opacity-main placeholder:text-reverse-0 placeholder:dark:text-base-0 bg-transparent focus:outline-none',
            true: '',
            false: '',
            null: ''
        }
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <input className = {getOption()?.classes + (status === false ? ' ' + getOption()?.false : '') + (status === true ? ' ' + getOption()?.true : '') + (status === null ? ' ' + getOption()?.null : '') + (classes ? ' ' + classes : '')} style = {styles} value = {value ? value : ''} type = {type} onChange = {onChange} ref = {ref} {...extras}/>
    )
})
export default Input