async function getUser(refresh_token) {
    const response = {
        status: false,
        user: null,
        message: ''
    }
    if (refresh_token !== undefined) {
        const params = {
            refresh_token: refresh_token,
        }
        const options = {
            method: 'POST',
            body: JSON.stringify(params)
        }
        await fetch(process.env.REACT_APP_API_URL + 'log-user', options) // Send user info to AWS to either log user in or register them.
        .then(async (lambdaResponse) => {
            if (lambdaResponse.status === 200) {
                lambdaResponse = await lambdaResponse.json()
                response.status = true
                response.user = lambdaResponse.user
            }
            else {
                lambdaResponse = await lambdaResponse.json()
                response.message = lambdaResponse.message
            }
        })
    }
    else {
        response.message = 'invalid login attempt.'
    }

    return response
}

export default getUser