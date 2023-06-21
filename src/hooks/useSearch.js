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
            setResults(params?.space)
        }
        else {
            const target = {}
            params?.categories.forEach(category => target[category] = params?.spaces[category])
            setResults(target)
        }
    }

    useEffect(() => {
        if (params) {
            initializeResults()
        }
    }, [params])

    useEffect(() => {
        if (input) {
            setSearchParams({...Object.fromEntries([...searchParams]), query: input}, { replace: true })
        }
        else if (input === '') {
            setSearchParams({...Object.fromEntries([...searchParams].filter(p => p[0] !== 'query'))}, { replace: true })
        }
    }, [input])

    useEffect(() => {
        if (params) {
            if (simpleSearch) {
                let newResults = []
                if (input !== '') {
                    if ((params?.space).length > 0) {
                        let fuseParams = {
                            threshold: 0.15,
                            keys: params?.keys
                        }
                        if (params?.minimumLength) {fuseParams.minMatchCharLength = params?.minimumLength}
                        let fuse = new Fuse(params?.space, fuseParams)
                        newResults = fuse.search(input).map(r => r.item)
                        if (params?.limit) { newResults = newResults.slice(0, params?.limit) }
                    }
                }
                else {
                    newResults = params?.space
                    if (params?.limit) { newResults = newResults.slice(0, params?.limit) }
                }
                setResults([...newResults])
            }
            else {
                const newResults = {}
                for (const category of params?.categories) {
                    if (input !== '') {
                        if ((params?.spaces[category]).length > 0) {
                            let fuseParams = {
                                threshold: 0.15,
                                keys: params?.keys[category]
                            }
                            if (params?.minimumLength) {fuseParams.minMatchCharLength = params?.minimumLength}
                            let fuse = new Fuse(params?.spaces[category], fuseParams)
                            newResults[category] = fuse.search(input).map(r => r.item)
                            if (params?.limits[category]) { newResults[category] = newResults[category].slice(0, params?.limits[category]) }
                        }
                    }
                    else {
                        newResults[category] = params?.spaces[category]
                        if (params?.limits[category]) { newResults[category] = newResults[category].slice(0, params?.limits[category]) }
                    }
                }
                if (params?.singleArray) {
                    setResults([...Object.keys(newResults).map(c => newResults[c].map(r => { return { category: c, item: r } })).flat(1)])
                }
                else {
                    setResults({...newResults})
                }
            }
        }
    }, [input, params])

    return { input, onInputChange, results, setParams }
}

export { useSearch }