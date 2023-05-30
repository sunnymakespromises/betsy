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
        'main': 'select-none contents whitespace-nowrap transition-all ease-in-out font-main text-3xl md:text-3xl text-base-0'
    }

    const getOption = () => {
        return options[preset]
    }

    return (
        <p className = {getOption() + (classes ? ' ' + classes : '')} style = {styles} {...extras}>{children}</p>
    )
}