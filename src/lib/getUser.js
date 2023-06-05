import authenticateUser from './authenticateUser'
import getItem from './aws/db/getItem'
import insertItem from './aws/db/insertItem'

async function getUser(refresh_token) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    if (refresh_token !== undefined) {
        await authenticateUser(refresh_token, async (user) => {
            const userWithGivenID = await getItem('Users', user.id) // get the user in the db from the user's id
            if (userWithGivenID) {
                response.status = true
                userWithGivenID.picture = userWithGivenID.picture + '?random=' + new Date().getTime()
                response.user = userWithGivenID
            }
            else {
                const item = {
                    'id': user.id,
                    'username': user.name.replace(/[^A-Za-z0-9-_.]/g, '').substring(0, ),
                    'email': user.email,
                    'picture': user.picture + '?random=' + new Date().getTime()
                }
                await insertItem('Users', item)
                response.status = true
                response.user = item
            }
        })
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export default getUser