async function getRefreshToken(code, setRefreshToken, setCookie) {
    const params = {
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000'
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(params)  
    }
    fetch('https://oauth2.googleapis.com/token', options)
    .then(async (res) => {
        const response = await res.json()
        setRefreshToken(response.refresh_token)
        setCookie('oauth-refresh-token', response.refresh_token)
    })
}

export default getRefreshToken