async function getUser(refresh_token, setUser, setCookie, removeCookie, setIsNewUser) {
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
                setCookie('user', lambdaResponse.user)
                setUser(lambdaResponse.user)
                if (lambdaResponse.isNewUser) {
                    setIsNewUser(true)
                }
            }
            else {
                lambdaResponse = await lambdaResponse.json()
                console.log(lambdaResponse.message)
                removeCookie('user')
                setUser(null)
            }
        })
    }
    else {
        removeCookie('user')
        setUser(null)
    }
}

export default getUser