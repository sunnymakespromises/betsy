/**
 * A <div> with the given image as the background.
 * @param {string} path the path to the image, relative to the public directory!
 * @param {object} styles the styles to pass to the image.
 * @param {string} classes the classes to pass to the image.
 * @param {string} mode how the background image takes up space of the div. either contain or cover. default is contain.
 * @param {boolean} contain if the image should be contained within the div. default is true.
 * @param {boolean} cover if the image should cover the div. default is false.
 * @returns a <div> with the given background image.
 */
export default function Image({ path, styles, classes, mode = 'contain', ...extras }) {
    function getMode() {
        return mode === 'contain' ? 'bg-contain' : mode === 'cover' ? 'bg-cover' : ''
    }
    return (
        <div className = {'bg-center ' + getMode() + ' bg-no-repeat' + (classes ? ' ' + classes : '')} style = {{ backgroundImage: 'url(' + path + ')', ...styles}} {...extras}/>
    )
}