import { useEffect, useState } from 'react'
import { useWindowContext } from '../contexts/window'
import { useInputs } from './useInputs'
import Fuse from 'fuse.js'

function useSearch(params) {
    const { searchParams, setSearchParams } = useWindowContext()
    const query = searchParams.get('query')
    const {inputs, onInputChange} = useInputs(['query'], [query ? query : ''])
    const [results, setResults] = useState({})

    function initializeResults() {
        const target = {}
        params?.categories.forEach(key => target[key] = [])
        setResults(target)
    }

    useEffect(() => {
        if (params) {
            initializeResults()
        }
    }, [params])

    useEffect(() => {
        setSearchParams({...Object.fromEntries([...searchParams]), query: inputs?.query}, { replace: true })
    }, [inputs])

    useEffect(() => {
        if (params) {
            const newResults = {}
            for (const category of params?.categories) {
                if ((params?.spaces[category]).length > 0) {
                    let fuse = new Fuse(params?.spaces[category], {
                        includeScore: true,
                        findAllMatches: false,
                        keys: params?.keys[category]
                    })
                    newResults[category] = fuse.search(inputs?.query).slice(0, params?.limits[category]).sort((a,b) => a?.score - b?.score)
                }
            }
            setResults({...newResults})
        }
    }, [inputs?.query, params])

    return { inputs, onInputChange, results }
}

export { useSearch }