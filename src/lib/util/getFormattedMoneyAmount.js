const formats = {
    dollars: {
        locale: 'en-US',
        multiplier: 1.00,
        symbol: {
            symbol: '$',
            before: true
        },
        space: '',
        thousands: '.',
        fractional: '.'
    },
    pounds: {
        locale: 'en-GB',
        multiplier: 0.79,
        symbol: {
            symbol: '£',
            before: true
        },
        space: '',
        thousands: '.',
        fractional: '.'
    },
    euros: {
        locale: 'de-DE',
        multiplier: 0.92,
        symbol: {
            symbol: '€',
            before: true
        },
        space: '',
        thousands: '.',
        fractional: ','
    },
    yen: {
        locale: 'ja-JP',
        multiplier: 141.83,
        symbol: {
            symbol: '¥',
            before: true
        },
        space: ' ',
        thousands: ',',
        fractional: '.'
    },
    yuan: {
        locale: 'zh-CN',
        multiplier: 7.29,
        symbol: {
            symbol: '¥',
            before: true
        },
        space: ' ',
        thousands: ',',
        fractional: '.'
    }
}

export default function getFormattedMoneyAmount(from, to, value, shortened) {
    from = from ? from : 'dollars'
    to = to ? to : 'dollars'
    let amount = value * ((1 / formats[from].multiplier) * formats[to].multiplier)

    const magnitudes = { 6: 'K', 9: 'M', 12: 'B', 15: 'T', 18: 'Qa', 21: 'Qi', 24: 'S' }
    function format(pre) {
        let formatted = (pre < 0 ? '-' : '') + (formats[to].symbol.before ? formats[to].symbol.symbol : '') + formats[to].space
        let length = pre.toString().split('.')[0].length
        if (shortened && length > 3) {
            let truncatedLength = ((length + 2) % 3) + 2
            let truncated = pre.toString().slice(0,truncatedLength)
            formatted += truncated.substr(0, truncatedLength - 1) + formats[to].thousands + truncated.substr(truncatedLength - 1)
            for (const magnitude of Object.keys(magnitudes)) {
                if (length <= magnitude) {
                    formatted += magnitudes[magnitude]
                    break
                }
            }
        }
        else {
            formatted += pre.toLocaleString(formats[to].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
        return formatted
    }

    return { 
        string: format(amount),
        value: Number(amount.toFixed(2))
    }
}

export function getCurrencySymbol(currency) {
    currency = currency ? currency : 'dollars'
    return formats[currency].symbol.symbol
}