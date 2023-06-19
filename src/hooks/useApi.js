import { initializeApiData as _initializeApiData } from '../lib/api/initializeApiData'
import { uploadPicture as _uploadPicture } from '../lib/api/uploadPicture'


function useApi() {
    async function initializeApiData() {
        return await _initializeApiData()
    }

    async function uploadPicture(category, object, value) {
        return await _uploadPicture(category, object, value)
    }

    return { initializeApiData, uploadPicture }
}

export { useApi }