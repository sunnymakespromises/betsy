/**
 * A <div> with the given image as the background.
 * @param {string} path the path to the image, relative to the public directory!
 * @param {object} styles the styles to pass to the image.
 * @param {string} classes the classes to pass to the image.
 * @param {boolean} contain if the image should be contained within the div. default is true.
 * @param {boolean} cover if the image should cover the div. default is false.
 * @returns a <div> with the given background image.
 */
export default function Image({ path, styles, classes, contain = true, cover = false, ...extras }) {
    return (
        <div className = {'bg-center ' + (contain ? 'bg-contain ' : cover ? 'bg-cover ' : '' ) + 'bg-no-repeat' + (classes ? ' ' + classes : '')} style = {{ backgroundImage: 'url(' + path + ')', ...styles}} {...extras}/>
    )
}