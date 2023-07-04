export default function shortenNumber(number, maxDigits) {
    const magnitudes = { 6: 'K', 9: 'M', 12: 'B', 15: 'T', 18: 'Qa', 21: 'Qi', 24: 'S' }
    let shortened
    let length = number.toString().split('.')[0].length
    if (length > maxDigits) {
        let truncatedLength = ((length + (maxDigits - 1)) % maxDigits) + (maxDigits - 1)
        let truncated = number.toString().slice(0,truncatedLength)
        shortened = truncated.substr(0, truncatedLength - 1) + '.' + truncated.substr(truncatedLength - 1)
        for (const magnitude of Object.keys(magnitudes)) {
            if (length <= magnitude) {
                shortened += magnitudes[magnitude]
                break
            }
        }
    }
    else {
        shortened = number.toString()
    }
    return shortened
}