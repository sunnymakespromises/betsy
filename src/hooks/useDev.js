import { useDataContext } from '../contexts/data'
import { uploadPicture as _uploadPicture } from '../lib/dev/uploadPicture'
import getTable from '../lib/aws/db/getTable'


function useDev() {
    const { updateData } = useDataContext()
    async function uploadPicture(object, value, single) {
        if (single) {
            const { status } = await _uploadPicture(object, value)
            if (status) {
                await updateData(object.category)
            }
        }
        else {
            for (let i = 0; i < object.length; i++) {
                await _uploadPicture(object[i], value[i])
            }
            for (const category of [...new Set(object.map(obj => obj.category))]) {
                await updateData(category)
            }
        }
    }

    async function getLogs() {
        return await getTable('Logs')
    }

    return { uploadPicture, getLogs }
}

export { useDev }