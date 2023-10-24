async function getRefreshToken(code, source) {
    const response = {
        status: false,
        message: '',
        refreshToken: null
    }
    if (code) {
        if (source === 'google') {
            const params = {
                client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
                client_secret: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: 'https://www.betsy.digital'
            }
            const options = {
                method: 'POST',
                body: JSON.stringify(params)  
            }
            await fetch('https://oauth2.googleapis.com/token', options)
            .then(async (res) => {
                if (res.status === 200) {
                    res = await res.json()
                    response.status = true
                    response.refreshToken = res.refresh_token
                }
                else {
                    res = await res.json()
                    response.message = res.message
                }
            })
        }
    }

    return response
}

export default getRefreshToken