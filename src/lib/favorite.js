import authenticateUser from './auth/authenticateUser'
import updateItem from './aws/db/updateItem'
import queryTable from './aws/db/queryTable'

async function addToFavorites(refresh_token, source, category, target) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        const betsyUser = await queryTable('Users', 'auth_id = ' + authUser.id, ['id', 'favorites'], true)
        if (betsyUser) {
            if (betsyUser.favorites[category].every(f => f.id !== target.id)) {
                await updateItem('Users', betsyUser.id, { favorites: {...betsyUser.favorites, [category]: [...betsyUser.favorites[category], { id: target.id, name: target.name, picture: target.picture }]} })
                response.status = true
            }
            else {
                response.message = 'user has already favorited the ' + category + ' with id ' + target.id + '.'
            }
        }
        else {
            response.message = 'user does not exist.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

async function removeFromFavorites(refresh_token, source, category, target) {
    const response = {
        status: false,
        message: ''
    }
    const authUser = await authenticateUser(refresh_token, source)
    if (authUser) {
        const betsyUser = await queryTable('Users', 'auth_id = ' + authUser.id, ['id', 'favorites'], true)
        if (betsyUser) {
            if (betsyUser.favorites[category].some(f => f.id === target.id)) {
                await updateItem('Users', betsyUser.id, { favorites: {...betsyUser.favorites, [category]: betsyUser.favorites[category].filter(f => f.id !== target.id)} })
                response.status = true
            }
            else {
                response.message = 'user has not favorited the ' + category + ' with id ' + target.id + ' yet.'
            }
        }
        else {
            response.message = 'user does not exist.'
        }
    }
    else {
        response.message = 'invalid refresh token.'
    }

    return response
}

export { addToFavorites, removeFromFavorites }