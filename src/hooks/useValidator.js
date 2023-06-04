function useValidator() {
    function validateInput(category, value, statuses, setStatus) {
        if (category === 'username') {
            if (value === '') {
                setStatus('username', false, 'username cannot be empty.')
            }
            else if (value.length < 6 || value.length > 15) {
                setStatus('username', false, 'username must be between 6 and 15 characters.')
            }
            else if (!(/^[a-zA-Z0-9-_.]+$/.test(value))) {
                setStatus('username', false, 'username cannot contain any special characters.')
            }
            else {
                setStatus('username', null, '')
            }
        }
    }

    return [validateInput]
}

export { useValidator }