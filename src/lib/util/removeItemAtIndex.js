export default function removeItemAtIndex(array, index) {
    let newArray = array
    newArray.splice(index, 1)
    return newArray
}