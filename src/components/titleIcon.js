import _ from 'lodash'
import { memo } from 'react'

const TitleIcon = memo(function TitleIcon({ icon, classes, parentId }) {
    let Icon = icon ? icon : null
    let DOMId = parentId
    return (
        icon && <Icon id = {DOMId + '-title-icon'} className = {'transition-colors duration-main h-5 aspect-square text-primary-main' + (classes ? ' ' + classes : '')}/>
    )
}, (b, a) => b.classes === a.classes && _.isEqual(b.icon, a.icon))

export default TitleIcon