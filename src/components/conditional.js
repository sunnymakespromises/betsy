export default function Conditional({ value, children }) {
    if (value) {
        return children
    }
    return null
}