import { initializeApiData as _initializeApiData } from '../lib/api/initializeApiData'


function useApi() {
    async function initializeApiData() {
        const response = await _initializeApiData()
    }

    return { initializeApiData }
}

export { useApi }