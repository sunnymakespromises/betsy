async function authenticateUser(refresh_token, source = 'google') {
    if (refresh_token !== undefined) {
        if (source === 'google') {
            const params = {
                client_id: process.env.REACT_APP_CLIENT_ID,
                client_secret: process.env.REACT_APP_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            }
            const options = {
                method: 'POST',
                body: JSON.stringify(params)
            }
            await fetch('https://www.googleapis.com/oauth2/v4/token', options)
            .then(async (step1Response) => {
                if (step1Response.status === 200) {
                    const { access_token } =  await step1Response.json()
                    await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, { headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }}) // use the access token to to get the google account's data
                    .then(async (step2Response) => {
                        if (step2Response.status === 200) {
                            const user = await step2Response.json()
                            console.log(user)
                            return user
                        }
                    })
                }
            })
        }
    }

    return null
}

export default authenticateUser