import updateItem from './aws/db/updateItem'
import arraymove from './util/arraymove'

async function addToFavorites(user, category, target) {
    const response = {
        status: false,
        changes: null,
        message: ''
    }
    // i get user favorites in the expanded form (id, display_name, picture), but i need to store them as just ids, and then return it to the client as expanded
    if (!user.favorites[category].some(f => f.id === target.id)) {
        let updatedFavorites = {}
        for (const category of Object.keys(user.favorites)) {
            updatedFavorites[category] = [...(user.favorites[category]).map(favorite => favorite.id)]
        }
        updatedFavorites[category].push(target.id)
        await updateItem('users', user.id, { favorites: updatedFavorites })
        response.changes = {favorites: {...user.favorites, [category]: [...user.favorites[category], { id: target.id, name: target.name, picture: target.picture }]}}
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
    // i get user favorites in the expanded form (id, display_name, picture), but i need to store them as just ids, and then return it to the client as expanded
    if (user.favorites[category].some(f => f.id === target.id)) {
        let updatedFavorites = {}
        for (const category of Object.keys(user.favorites)) {
            updatedFavorites[category] = [...(user.favorites[category]).map(favorite => favorite.id)]
        }
        updatedFavorites[category] = updatedFavorites[category].filter(f => f !== target.id)
        await updateItem('users', user.id, { favorites: updatedFavorites })
        response.changes = { favorites: {...user.favorites, [category]: user.favorites[category].filter(f => f.id !== target.id)} }
        response.status = true
    }
    else {
        response.message = 'user has not favorited the ' + category + ' with id ' + target.id + ' yet.'
    }

    return response
}

async function rearrangeFavorites(user, category, source, target) {
    const response = {
        status: false,
        changes: null,
        message: ''
    }
    let updatedFavorites = {}
    for (const category of Object.keys(user.favorites)) {
        updatedFavorites[category] = [...(user.favorites[category]).map(favorite => favorite.id)]
    }
    let sourceIndex = updatedFavorites[category].indexOf(source.id)
    let targetIndex = updatedFavorites[category].indexOf(target.id)
    updatedFavorites[category] = arraymove(updatedFavorites[category], sourceIndex, targetIndex)
    await updateItem('users', user.id, { favorites: updatedFavorites })
    response.changes = {favorites: {...user.favorites, [category]: arraymove(user.favorites[category], sourceIndex, targetIndex)}}
    response.status = true

    return response
}

export { addToFavorites, removeFromFavorites, rearrangeFavorites }