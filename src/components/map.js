export default function Map({ items, callback }) {
    return (
       items && items.length > 0 && items.map((obj, index) => { return callback(obj, index) })
    )
}