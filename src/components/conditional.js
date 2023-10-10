import { memo } from 'react'

const Conditional = memo(function Conditional({ value, children }) {
    if (value) {
        return children
    }
})

export default Conditional