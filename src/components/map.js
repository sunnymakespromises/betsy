export default function Map({ array, callback }) {
    return (
       array && array.length > 0 && array.map((obj, index) => { return callback(obj, index) })
    )
}