export default function downloadJSON(contents, name) {
    const element = document.createElement('a')
    const textFile = new Blob([JSON.stringify(contents)], {type: 'text/plain'})
    element.href = URL.createObjectURL(textFile)
    element.download = name
    document.body.appendChild(element)
    element.click()
}