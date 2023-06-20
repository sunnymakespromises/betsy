import { executeEdgeFunctions as _executeEdgeFunctions } from '../lib/api/executeEdgeFunctions'
import { uploadPicture as _uploadPicture } from '../lib/api/uploadPicture'


function useApi() {
    async function executeEdgeFunctions() {
        return await _executeEdgeFunctions()
    }

    async function uploadPicture(category, object, value) {
        return await _uploadPicture(category, object, value)
    }

    return { executeEdgeFunctions, uploadPicture }
}

export { useApi }