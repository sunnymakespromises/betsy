import updateItem from './aws/db/updateItem'

async function addToFavorites(user, category, target) {
    const response = {
        status: false,
        changes: null,
        message: ''
    }
    if (user.favorites[category].every(f => f.id !== target.id)) {
        let updatedFavorites = {...user.favorites, [category]: [...user.favorites[category], target.id]}
        await updateItem('Users', user.id, { favorites: updatedFavorites })
        response.changes = { favorites: updatedFavorites }
        response.status = true
    }
    else {
        response.message = 'user has already favorited the ' + category + ' with id ' + target.id + '.'
    }

    return response
}

async function removeFromFavorites(user, category, target) {
    const response = {
        status: false,
        changes: null,
        message: ''
    }
    if (user.favorites[category].some(f => f.id === target.id)) {
        let updatedFavorites = { ...user.favorites, [category]: user.favorites[category].filter(f => f !== target.id)}
        await updateItem('Users', user.id, { favorites: updatedFavorites })
        response.changes = { favorites: updatedFavorites }
        response.status = true
    }
    else {
        response.message = 'user has not favorited the ' + category + ' with id ' + target.id + ' yet.'
    }

    return response
}

export { addToFavorites, removeFromFavorites }