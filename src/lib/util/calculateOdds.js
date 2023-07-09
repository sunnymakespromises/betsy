export default function calculateOdds(format, value) {
    format = format ? format : 'american'
    switch (format) {
        case 'american':
            return (value > 0 ? '+' : '') + value.toString()
        case 'decimal':
            return (value > 0 ? ((value / 100) + 1) : ((value - 100) / value)).toFixed(2).toString()
        case 'fractional':
            let fraction = reduce(Math.abs(value), 100)
            return (value > 0 ? (fraction[0] + '/' + fraction[1]) : (fraction[1] + '/' + fraction[0]))
        default:
            return null
    }

    function reduce(numerator, denominator) {
        var a = numerator;
        var b = denominator;
        var c;
        while (b) {
            c = a % b; a = b; b = c;
        }
        return [numerator / a, denominator / a];
    }
}