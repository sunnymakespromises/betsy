import { uploadPicture as _uploadPicture } from '../lib/api/uploadPicture'


function useApi() {
    async function uploadPicture(category, object, value) {
        return await _uploadPicture(category, object, value)
    }

    return { uploadPicture }
}

export { useApi }