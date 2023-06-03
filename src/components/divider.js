/**
 * A <div> tag that spans the full width of its parent with the given thickness and color.
 * @param {string} size the thicnkess of the divider. default is 'main'
 * @param {string} color the color of the divider. default is 'reverse-0'.
 * @param {string} width the width of the divider. default is 'full'.
 * @param {string} classes the classes to be passed to the text.
 * @param {element} children the elements to be rendered inside of the <p> tag as children. you don't have to actually pass it like children = x, just put <Text><x/></Text>.
 * @returns a <div> tag.
 */
export default function Divider({ thickness = 'main', color = 'reverse-0', width = 'full', classes, ...extras }) {
    function getWidth() {
        return 'w-' + width + ' '
    }
    function getBorder() {
        return 'border-' + color + ' border-' + thickness
    }

    return (
        <div className = {'rounded-full ' + getWidth() + getBorder() + (classes ? ' ' + classes : '')} {...extras}/>
    )
}