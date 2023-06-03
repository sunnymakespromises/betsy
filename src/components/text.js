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
        'main': 'select-none transition-all ease-in-out font-main font-semibold text-3xl md:text-3xl text-reverse-0',
        'title': 'whitespace-nowrap select-none transition-all ease-in-out font-main font-extrabold text-5xl md:text-6xl text-reverse-0',
        'login-title': 'whitespace-nowrap select-none transition-all ease-in-out font-main font-extrabold text-4xl md:text-6xl text-reverse-0',
        'button': 'whitespace-nowrap select-none font-main font-semibold text-2xl md:text-2xl text-gray-400',
        'settings-title': 'whitespace-nowrap select-none font-main font-semibold text-2xl md:text-2xl text-gray-400',
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <p className = {getOption() + (classes ? ' ' + classes : '')} style = {styles} {...extras}>{children}</p>
    )
}