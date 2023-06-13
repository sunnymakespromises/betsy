import { useWindowContext } from '../contexts/window'
import { initializeApiData as _initializeApiData } from '../lib/api/initializeApiData'


function useApi() {
    const { cookies } = useWindowContext()
    async function initializeApiData() {
        const response = await _initializeApiData(cookies['odds-format'])
        if (response.status) {
            console.log('done!')
        }
        else {
            console.log(response.message)
        }
    }

    return { initializeApiData }
}

export { useApi }