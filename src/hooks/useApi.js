import { initializeApiData as _initializeApiData } from '../lib/api/initializeApiData'


function useApi() {
    async function initializeApiData() {
        await _initializeApiData()
    }

    return { initializeApiData }
}

export { useApi }