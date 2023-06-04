/**
 * A <div> tag that has page stylings with the given children.
 * @param {boolean} fill whether the page should fill up the whole window or shrink to fit the content.
 * @param {string} classes the classes to be passed to the text.
 * @param {element} children the elements to be rendered inside of the <div> tag as children. you don't have to actually pass it like children = x, just put <Page><x/></Page>.
 * @returns a <div> tag.
 */
export default function Page({ fill = false, classes, children, ...extras }) {
    function getSize() {
        return fill ? 'min-w-full min-h-full' : 'min-w-0 min-h-0'
    }

    return (
        <div className = {'page transition-all duration-main ease-in-out rounded-main dark:backdrop-brightness-light backdrop-brightness-dark p-8 shadow-xl ' + getSize() + (classes ? ' ' + classes : '')} {...extras}>
            {children}
        </div>
    )
}