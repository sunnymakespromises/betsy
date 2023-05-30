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
            classes: 'font-main w-min transition-all ease-in-out text-base-0 text-3xl bg-black bg-opacity-30 focus:outline-none px-3 py-2 rounded-xl',
            true: 'bg-emerald-50 border border-emerald-500 text-emerald-900',
            false: 'bg-rose-900 border border-4 border-rose-500',
            null: 'border border-4 border-transparent'
        }
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <input className = {getOption()?.classes + (status === false ? ' ' + getOption()?.false : '') + (status === true ? ' ' + getOption()?.true : '') + (status === null ? ' ' + getOption()?.null : '') + (classes ? ' ' + classes : '')} style = {styles} value = {value} type = {type} onChange = {onChange} {...extras}/>
    )
}