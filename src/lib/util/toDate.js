export default function toDate(unix, shortened = false) {
    return new Date(unix * 1000).toLocaleDateString('en-US', {
        year: shortened ? '2-digit' : 'numeric',
        month: shortened ? 'numeric' : 'long',
        day: shortened ? 'numeric' : 'numeric',
        ...(!shortened ? {
            hour: 'numeric',
            minute: '2-digit',
        } : {})
    })
}