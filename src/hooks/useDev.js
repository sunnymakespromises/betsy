import { useDataContext } from '../contexts/data'
import { updateItem as _updateItem } from '../lib/dev/updateItem'
import getTable from '../lib/aws/db/getTable'


function useDev() {
    const { updateData } = useDataContext()
    async function updateItem(object, category, value, single) {
        if (single) {
            const response = await _updateItem(object, category, value)
            if (response.status) {
                await updateData(object.category)
                return response
            }
        }
        else {
            for (let i = 0; i < object.length; i++) {
                await _updateItem(object[i], category, value[i])
            }
            for (const objectCategory of [...new Set(object.map(obj => obj.category))]) {
                await updateData(objectCategory)
            }
        }
    }

    async function getLogs() {
        return await getTable('Logs')
    }

    return { updateItem, getLogs }
}

export { useDev }