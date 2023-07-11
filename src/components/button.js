import { useMemo } from 'react'

/**
 * A <div> representing a button with the given preset and triggers the given onClick function when pressed.
 * @param {string} preset the preset to the applied to the button.
 * @param {object} styles the styles to be passed to the button.
 * @param {string} classes the classes to be passed to the button.
 * @param {function} onClick the function to be triggered when the button is pressed.
 * @param {element} children the elements to be rendered inside of the <div> tag as children. you don't have to actually pass it like children = {x}, just put <Button><x/></Button>.
 * @returns a <div> tag.
 */
export default function Button({ preset = 'main', styles, classes, onClick, children, ...extras }) {
    let options = {
        main: 'transition-all duration-slow flex justify-center items-center bg-reverse-0 rounded-main p-small cursor-pointer',
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
        <div className = {option + (classes ? ' ' + classes : '') + ' cursor-pointer'} style = {styles} onClick = {onClick} {...extras}>
            {children ? children : null}
        </div>
    )
}