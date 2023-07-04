import { useDataContext } from '../contexts/data'
import { uploadPicture as _uploadPicture } from '../lib/dev/uploadPicture'
import getTable from '../lib/aws/db/getTable'


function useDev() {
    const { updateData } = useDataContext()
    async function uploadPicture(category, object, value) {
        const { status } = await _uploadPicture(category, object, value)
        if (status) {
            await updateData(category)
        }
    }

    async function getLogs() {
        return await getTable('Logs')
    }

    return { uploadPicture, getLogs }
}

export { useDev }