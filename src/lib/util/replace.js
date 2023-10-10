export default function replace(arr, target, source) {
    const newArr = [...arr]
    newArr[newArr.indexOf(target)] = source
    return newArr
}