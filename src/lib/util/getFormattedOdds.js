import { Fraction } from 'fractional'

export default function getFormattedOdds(format, decimalValue) {
    format = format ? format : 'american'
    switch (format) {
        case 'american':
            return (decimalValue > 2 ? '+' : '') + (decimalValue === 1 ? 100 : Number((decimalValue > 2 ? ((decimalValue - 1) * 100) : (-100 / (decimalValue - 1))).toFixed(0)))
        case 'decimal':
            return decimalValue.toFixed(2)
        case 'fractional':
            let fraction = new Fraction(decimalValue)
            return fraction.toString()
        default:
            return null
    }
}