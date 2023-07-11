export default function arraymove(arr, fromIndex, toIndex) {
    let copy = [...arr]
    var element = copy[fromIndex]
    copy.splice(fromIndex, 1)
    copy.splice(toIndex, 0, element)
    return copy
}