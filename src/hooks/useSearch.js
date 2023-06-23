import { useEffect, useMemo, useState } from 'react'
import { useWindowContext } from '../contexts/window'
import { useInput } from './useInput'
import Fuse from 'fuse.js'

function useSearch() {
    const { searchParams, setSearchParams } = useWindowContext()
    const [params, setParams] = useState()
    const queryParam = searchParams.get('query')
    const filtersParam = useMemo(() => searchParams.get('filters')?.split(','), [searchParams])
    const {input, onInputChange} = useInput(null, queryParam ? queryParam : '')
    const [results, setResults] = useState({})
    const [filters, setFilters] = useState()
    const simpleSearch = !(params?.categories)

    function initializeResults() {
        if (simpleSearch) {
            setResults(params?.space)
        }
        else {
            let newResults = {}
            params?.categories.forEach(category => newResults[category] = params?.spaces[category])
            setResults(newResults)
        }
    }

    function initializeFilters() {
        let newFilters = {}
        Object.keys(params?.filters)?.forEach(filter => newFilters[filter] = (filtersParam?.includes(filter) ? true : false))
        setFilterParams(newFilters)
    }

    useEffect(() => {
        if (params) {
            initializeResults()
            initializeFilters()
        }
    }, [params])

    useEffect(() => {
        if (params) {
            let newFilters = {}
            Object.keys(params?.filters)?.forEach(filter => newFilters[filter] = (filtersParam?.includes(filter) ? true : false))
            setFilters(newFilters)
        }
    }, [params, filtersParam])

    useEffect(() => {
        if (input) {
            setSearchParams({...Object.fromEntries([...searchParams]), query: input}, { replace: true })
        }
        else if (input === '') {
            setSearchParams({...Object.fromEntries([...searchParams].filter(p => p[0] !== 'query'))}, { replace: true })
        }
    }, [input])

    useEffect(() => {
        if (params && filters) {
            if (simpleSearch) {
                let newResults = []
                if (input !== '') {
                    if ((params?.space).length > 0) {
                        let fuseParams = {
                            threshold: 0.15,
                            keys: params?.keys
                        }
                        if (params?.minimumLength) { fuseParams.minMatchCharLength = params?.minimumLength }
                        let fuse = new Fuse(params?.space, fuseParams)
                        newResults = fuse.search(input).map(r => r.item)
                        newResults = filter(newResults)
                        if (params?.limit) { newResults = newResults.slice(0, params?.limit) }
                    }
                }
                else {
                    newResults = params?.space
                    newResults = filter(newResults)
                    if (params?.limit) { newResults = newResults.slice(0, params?.limit) }
                }
                setResults([...newResults])
            }
            else {
                let newResults = {}
                for (const category of params?.categories) {
                    if (input !== '') {
                        if ((params?.spaces[category]).length > 0) {
                            let fuseParams = {
                                threshold: 0.15,
                                keys: params?.keys[category]
                            }
                            if (params?.minimumLength) {
                                if (params?.minimumLength.constructor.name === 'Number') {
                                    fuseParams.minMatchCharLength = params?.minimumLength
                                }
                                else {
                                    fuseParams.minMatchCharLength = params?.minimumLength[category]
                                }
                            }
                            let fuse = new Fuse(params?.spaces[category], fuseParams)
                            newResults[category] = fuse.search(input).map(r => r.item)
                            if (!params?.singleArray) {
                                newResults[category] = filter(newResults[category])
                                if (params?.limits[category]) { newResults[category] = newResults[category].slice(0, params?.limits[category]) }
                            }
                        }
                    }
                    else {
                        newResults[category] = params?.spaces[category]
                        if (!params?.singleArray) {
                            newResults[category] = filter(newResults[category])
                            if (params?.limits[category]) { newResults[category] = newResults[category].slice(0, params?.limits[category]) }
                        }
                    }
                }
                if (params?.singleArray) {
                    newResults = Object.keys(newResults).map(c => newResults[c].map(r => { return { category: c, item: r } })).flat(1)
                    newResults = filter(newResults)
                    if (params?.limit) { newResults = newResults.slice(0, params?.limit) }
                    setResults([...newResults])
                }
                else {
                    setResults({...newResults})
                }
            }
        }
    }, [input, params, filters])

    function setFilter(filter, value) {
        let newFilters = {...filters}
        newFilters[filter] = value
        if (value === true && params?.filters[filter].turnsOff) {
            for (const targetFilter of params?.filters[filter].turnsOff) {
                if (newFilters[targetFilter]) {
                    newFilters[targetFilter] = false
                }
            }
        }
        setFilterParams(newFilters)
    }

    function setFilterParams(newFilters) {
        if (Object.keys(newFilters).some(f => newFilters[f] === true)) {
            setSearchParams({...Object.fromEntries([...searchParams]), filters: Object.keys(newFilters).filter(filter => newFilters[filter] === true).join(',')}, { replace: true })
        }
        else {
            setSearchParams({...Object.fromEntries([...searchParams].filter(param => param[0] !== 'filters'))}, { replace: true })
        }
    }

    function filter(newResults) {
        let filteredResults = newResults
        if (params?.filters) {
            for (const filter of Object.keys(params?.filters)) {
                if (filters[filter] === true) {
                    filteredResults = params?.filters[filter]?.fn(filteredResults)
                }
            }
        }
        return filteredResults
    }

    return { input, onInputChange, results, filters, setFilter, setParams }
}

export { useSearch }