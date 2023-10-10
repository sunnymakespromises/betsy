import { memo } from 'react'
import Text from './text'

const Error = memo(function Error({ message, classes, parentId }) {
    let DOMId = parentId + '-error'
    return (
        <div id = {DOMId} className = {'w-full overflow-hidden transition-all duration-main ' + (message ? 'max-h-full' : 'max-h-0') + (classes ? ' ' + classes : '')}>
            <Text id = {DOMId + '-text'} preset = 'subtitle' classes = 'text-text-highlight/killed'>
                {message}
            </Text>
        </div>
    )
})

export default Error