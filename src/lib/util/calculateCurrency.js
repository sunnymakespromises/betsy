export default function calculateCurrency(currency, amount, shortened) {
    const formats = {
        Dollars: {
            locale: 'en-US',
            symbol: {
                symbol: '$',
                before: true
            },
            space: '',
            thousands: '.',
            fractional: '.'
        },
        Pounds: {
            locale: 'en-GB',
            symbol: {
                symbol: '£',
                before: true
            },
            space: '',
            thousands: '.',
            fractional: '.'
        },
        Euros: {
            locale: 'de-DE',
            symbol: {
                symbol: '€',
                before: true
            },
            space: '',
            thousands: '.',
            fractional: ','
        },
        Yen: {
            locale: 'ja-JP',
            symbol: {
                symbol: '¥',
                before: true
            },
            space: ' ',
            thousands: ',',
            fractional: '.'
        },
        Yuan: {
            locale: 'zh-CN',
            symbol: {
                symbol: '¥',
                before: true
            },
            space: ' ',
            thousands: ',',
            fractional: '.'
        }
    }

    const magnitudes = { 6: 'K', 9: 'M', 12: 'B', 15: 'T', 18: 'Qa', 21: 'Qi', 24: 'S' }

    function format(pre) {
        let formatted = (pre < 0 ? '-' : '') + (formats[currency].symbol.before ? formats[currency].symbol.symbol : '') + formats[currency].space
        let length = pre.toString().split('.')[0].length
        if (shortened && length > 3) {
            let truncatedLength = ((length + 2) % 3) + 2
            let truncated = pre.toString().slice(0,truncatedLength)
            formatted += truncated.substr(0, truncatedLength - 1) + formats[currency].thousands + truncated.substr(truncatedLength - 1)
            for (const magnitude of Object.keys(magnitudes)) {
                if (length <= magnitude) { formatted += magnitudes[magnitude];break }
            }
        }
        else {
            formatted += pre.toLocaleString(formats[currency].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        return formatted
    }

    switch (currency) {
        case 'Dollars': return format(amount)
        case 'Pounds': return format(amount * 0.779)
        case 'Euros': return format(amount * 0.9)
        case 'Yen': return format(amount * 141.83502)
        case 'Yuan': return format(amount * 7.1)
        default: return format(amount)
    }
}