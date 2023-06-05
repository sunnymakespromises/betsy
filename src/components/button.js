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
        'main': 'transition-all duration-main ease-in-out bg-base-0 hover:bg-base-100 rounded-main p-4 border-thin border-divide-0 dark:border-divide-100 cursor-pointer flex justify-center items-center',
        'signout': 'transition-all duration-main ease-in-out bg-reverse-0 rounded-full p-4'
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