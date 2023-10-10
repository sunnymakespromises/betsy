import _ from 'lodash'
import { memo } from 'react'

const TitleIcon = memo(function TitleIcon({ icon, classes, parentId }) {
    let DOMId = parentId
    let Icon = icon ? icon : null
    
    return (
        icon && <Icon id = {DOMId + '-title-icon'} className = {'transition-colors duration-main h-4 aspect-square text-primary-main' + (classes ? ' ' + classes : '')}/>
    )
}, (b, a) => b.classes === a.classes && _.isEqual(b.icon, a.icon))

export default TitleIcon