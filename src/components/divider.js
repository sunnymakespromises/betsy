/**
 * A <div> tag that spans the full width of its parent with the given thickness and color.
 * @param {string} thickness the thicnkess of the divider. default is 'main'
 * @param {string} color the color of the divider. default is 'reverse-0'.
 * @param {string} size the size of the divider. default is 'full'.
 * @param {boolean} vertical if the divider is vertical or horizontal. default is false.
 * @param {string} classes the classes to be passed to the text.
 * @returns a <div> tag.
 */
export default function Divider({ thickness = 'main', color = 'reverse-0', size = 'full', vertical = false, classes, ...extras }) {
    function getSize() {
        return (vertical ? 'h-' : 'w-') + size + ' '
    }
    function getBorder() {
        return 'border-' + color + ' border-' + thickness
    }

    return (
        <div className = {'rounded-full ' + getSize() + getBorder() + (classes ? ' ' + classes : '')} {...extras}/>
    )
}