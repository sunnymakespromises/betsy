import { memo } from 'react'

const Conditional = memo(function Conditional({ value, children }) {
    if (value) {
        return children
    }
}, (b, a) => b.value === a.value && b.children === a.children)

export default Conditional