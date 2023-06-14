import { useWindowContext } from '../contexts/window'
import { initializeApiData as _initializeApiData } from '../lib/api/initializeApiData'


function useApi() {
    const { cookies } = useWindowContext()
    async function initializeApiData() {
        const response = await _initializeApiData(cookies['odds-format'])
    }

    return { initializeApiData }
}

export { useApi }