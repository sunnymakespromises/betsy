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
        'main': 'select-none font-main font-semibold text-3xl md:text-3xl text-reverse-0 dark:text-base-0',
        'title': 'whitespace-nowrap select-none cursor-default font-main font-bold text-3xl md:text-4xl text-reverse-0 dark:text-base-0',
        'button': 'whitespace-nowrap select-none font-main font-semibold text-lg md:text-2xl text-reverse-0 dark:text-base-0',
        'profile-error': 'whitespace-nowrap select-none cursor-default font-main font-semibold text-xs md:text-xs text-reverse-0 dark:text-base-0',
        'explore-result': 'whitespace-nowrap select-none font-main font-semibold text-xl md:text-2xl text-reverse-0 dark:text-base-0',
        'explore-result-subtitle': 'whitespace-nowrap select-none font-main font-semibold text-xs md:text-sm !text-opacity-main text-reverse-0 dark:text-base-0',
        'competitor': 'whitespace-nowrap select-none font-main font-semibold text-lg md:text-2xl text-reverse-0 dark:text-base-0'
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <p className = {getOption() + (classes ? ' ' + classes : '')} style = {styles} {...extras}>{children}</p>
    )
}