/**
 * A <p> tag with the given preset and content.
 * @param {string} preset the preset to be applied to the text.
 * @param {object} styles the styles to be passed to the text.
 * @param {string} classes the classes to be passed to the text.
 * @param {element} children the elements to be rendered inside of the <p> tag as children. you don't have to actually pass it like children = x, just put <Text><x/></Text>.
 * @returns a <p> tag.
 */
export default function Text({ preset = 'main', styles, classes, children, ...extras }) {
    let options = {
        'main': 'select-none transition-all duration-main ease-in-out font-main font-semibold tracking-tighter text-3xl md:text-3xl text-reverse-0',
        'title': 'whitespace-nowrap select-none transition-all duration-main ease-in-out font-main font-bold tracking-tighter text-3xl md:text-4xl text-reverse-0',
        'login-title': 'whitespace-nowrap select-none transition-all duration-main ease-in-out font-main font-semibold tracking-tighter text-2xl md:text-2xl text-reverse-0',
        'button': 'transition-all duration-main ease-in-out whitespace-nowrap select-none font-main font-semibold tracking-tighter text-lg md:text-2xl text-light-0 dark:text-light-100',
        'profile-title': 'transition-all duration-main ease-in-out whitespace-nowrap select-none font-main font-semibold tracking-tighter text-2xl md:text-2xl text-reverse-0',
        'profile-error': 'transition-all duration-main ease-in-out whitespace-nowrap select-none font-main font-semibold tracking-tighter text-xs md:text-xs text-reverse-0',
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <p className = {getOption() + (classes ? ' ' + classes : '')} style = {styles} {...extras}>{children}</p>
    )
}