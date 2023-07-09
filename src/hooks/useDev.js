import { useDataContext } from '../contexts/data'
import { uploadPicture as _uploadPicture } from '../lib/dev/uploadPicture'
import getTable from '../lib/aws/db/getTable'


function useDev() {
    const { updateData } = useDataContext()
    async function uploadPicture(object, value) {
        const { status } = await _uploadPicture(object, value)
        if (status) {
            await updateData(object.category)
        }
    }

    async function getLogs() {
        return await getTable('Logs')
    }

    return { uploadPicture, getLogs }
}

export { useDev }