async function databaseOperation({operation, table, data, fn = 'db'}) {
    const response = {
        status: false,
        body: {},
        message: ''
    }
    const params = {
        operation: operation,
        table: 'Betsy_' + table,
        ...data
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(params)
    }
    await fetch(process.env.REACT_APP_API_URL + fn, options) // Send info to AWS lambda with the given params
    .then(async (lambdaResponse) => {
        if (lambdaResponse.status === 200) {
            lambdaResponse = await lambdaResponse.json()
            response.status = true
            response.body = lambdaResponse
        }
        else {
            lambdaResponse = await lambdaResponse.json()
            response.message = lambdaResponse.message
        }
    })

    return response
}

export default databaseOperation