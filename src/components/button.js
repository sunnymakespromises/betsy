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
        'main': 'transition-all duration-slow bg-reverse-0 dark:bg-base-0 hover:scale-smaller !bg-opacity-faint hover:!bg-opacity-main rounded-full md:rounded-main p-4 cursor-pointer flex justify-center items-center',
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <div className = {getOption() + (classes ? ' ' + classes : '') + ' cursor-pointer'} style = {styles} onClick = {onClick} {...extras}>
            {children ? children : null}
        </div>
    )
}