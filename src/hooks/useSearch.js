import { useEffect, useState } from 'react'
import { useWindowContext } from '../contexts/window'
import { useInput } from './useInput'
import Fuse from 'fuse.js'

function useSearch() {
    const { searchParams, setSearchParams } = useWindowContext()
    const [params, setParams] = useState()
    const query = searchParams.get('query')
    const {input, onInputChange} = useInput(null, query ? query : '')
    const [results, setResults] = useState({})
    const simpleSearch = !(params?.categories)

    function initializeResults() {
        if (simpleSearch) {
            setResults(params?.emptyOnInitial ? [] : params?.space)
        }
        else {
            const target = {}
            params?.categories.forEach(category => target[category] = params?.emptyOnInital ? [] : params?.spaces[category])
            setResults(target)
        }
    }

    useEffect(() => {
        if (params) {
            initializeResults()
        }
    }, [params])

    useEffect(() => {
        setSearchParams({...Object.fromEntries([...searchParams]), query: input}, { replace: true })
    }, [input])

    useEffect(() => {
        if (params) {
            if (simpleSearch) {
                let newResults = []
                if (input !== '') {
                    if ((params?.space).length > 0) {
                        let fuse = new Fuse(params?.space, {
                            threshold: 0.3,
                            keys: params?.keys
                        })
                        newResults = fuse.search(input).slice(0, params?.limit).map(r => r.item)
                    }
                }
                else {
                    newResults = params?.emptyOnInitial ? [] : params?.space
                    if (!params?.fullSpaceOnInitial) { newResults = newResults.slice(0, params?.limit) }
                }
                setResults([...newResults])
            }
            else {
                const newResults = {}
                for (const category of params?.categories) {
                    if (input !== '') {
                        if ((params?.spaces[category]).length > 0) {
                            let fuse = new Fuse(params?.spaces[category], {
                                threshold: 0.3,
                                keys: params?.keys[category]
                            })
                            newResults[category] = fuse.search(input).slice(0, params?.limits[category]).map(r => r.item)
                        }
                    }
                    else {
                        newResults[category] = params?.emptyOnInitial ? [] : params?.spaces[category]
                        if (!params?.fullSpaceOnInitial) { newResults[category] = newResults[category].slice(0, params?.limits[category]) }
                    }
                }
                setResults({...newResults})
            }
        }
    }, [input, params])

    return { input, onInputChange, results, setParams }
}

export { useSearch }