import { useRootContext } from '../contexts/root'
import { uploadPicture as _uploadPicture } from '../lib/dev/uploadPicture'
import getTable from '../lib/aws/db/getTable'


function useDev() {
    const { refreshData } = useRootContext()
    async function uploadPicture(category, object, value) {
        const { status } = await _uploadPicture(category, object, value)
        if (status) { await refreshData() }
    }

    async function getLogs() {
        return await getTable('Logs')
    }

    return { uploadPicture, getLogs }
}

export { useDev }