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
export default function Input({ value, status, type = 'text', preset = 'main', styles, classes, onChange, ...extras }) {
    let options = {
        'main': {
            classes: 'font-main w-min transition-all duration-main ease-in-out text-base-0 text-3xl bg-black bg-opacity-30 focus:outline-none px-3 py-2 rounded-xl',
            true: '',
            false: '',
            null: ''
        },
        'profile': {
            classes: 'text-center font-main font-bold w-full transition-all duration-main ease-in-out text-reverse-0 tracking-tighter text-3xl md:text-3xl rounded-xl placeholder:dark:text-light-100 placeholder:text-light-0 bg-transparent focus:outline-none',
            true: '',
            false: '',
            null: ''
        }
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <input className = {getOption()?.classes + (status === false ? ' ' + getOption()?.false : '') + (status === true ? ' ' + getOption()?.true : '') + (status === null ? ' ' + getOption()?.null : '') + (classes ? ' ' + classes : '')} style = {styles} value = {value} type = {type} onChange = {onChange} {...extras}/>
    )
}