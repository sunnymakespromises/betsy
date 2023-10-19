import _ from 'lodash'
import { memo, useMemo } from 'react'

/**
 * A <p> tag with the given preset and content.
 * @param {string} preset the preset to be applied to the text.
 * @param {object} styles the styles to be passed to the text.
 * @param {string} classes the classes to be passed to the text.
 * @param {element} children the elements to be rendered inside of the <p> tag as children. you don't have to actually pass it like children = x, just put <Text><x/></Text>.
 * @returns a <p> tag.
 */
const Text = memo(function Text({ preset = 'body', styles, classes, children, ...extras }) {
    let options = {
        body: 'transition-colors duration-main select-none font-main font-medium text-base',
        title: 'transition-colors duration-main select-none font-main font-medium text-xl',
        subtitle: 'transition-colors duration-main select-none font-main font-medium text-sm'
    }

    let option = useMemo(() => {
        let presetPath = preset.split('-')
        let option = options[presetPath[0]]
        for (const path of presetPath.slice(1)) {
            option = option[path]
        }
        return option ? option : ''
    }, [preset])

    return (
        <p className = {option + (classes ? ' ' + classes : '')} style = {styles} {...extras}>{children}</p>
    )
}, (b, a) => b.preset === a.preset && b.classes === a.classes && b.children === a.children && _.isEqual(b.extras, a.extras) && _.isEqual(b.styles, a.styles))


export default Text