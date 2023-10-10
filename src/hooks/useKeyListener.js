import { useEffect } from 'react'

function useKeyListener(keys, callback) {
    useEffect(() => {
        function handleKeyPress(event) {
            for (const key of keys) {
                if (key === event.code) {
                    callback()
                    break
                }
                if (key.includes('Ctrl')) {
                    if ((event.metaKey || event.ctrlKey) && event.code === key.replace('Ctrl', '')) {
                        callback()
                        break
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [keys, callback])
}

export { useKeyListener }