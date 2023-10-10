import { useEffect, useMemo, useRef, useState } from 'react'
import { useInput } from './useInput'
import Fuse from 'fuse.js'
import { useCookies } from 'react-cookie'

function useSearch(config) {
    const isSimple = !(config.categories)
    const queryId = useRef()
    queryId.current = config.id + '_query'
    const filtersId = useRef()
    filtersId.current = config.id + '_filters'
    const [cookies, _setCookie, _removeCookie] = useCookies([queryId.current, filtersId.current])
    const queryParam = useMemo(() => cookies[queryId?.current], [cookies, config])
    const filtersParam = useMemo(() => cookies[filtersId?.current], [cookies, config])
    const filters = useMemo(() => {
        if (config.filters) {
            let newFilters = {}
            Object.keys(config.filters).forEach(filter => newFilters[filter] = {...config.filters[filter], active: filtersParam && filtersParam[filter] ? filtersParam[filter].active : false})
            return newFilters
        }
        else {
            return null
        }
    }, [cookies, config])
    const filtersRef = useRef()
    filtersRef.current = filters
    const {input, onInputChange} = useInput(null, queryParam ? queryParam : '')
    const [results, setResults] = useState(getResults())
    const hasResults = useMemo(() => {
        return input !== '' ? config.shape === 'array' ? results?.length > 0 : Object.keys(results)?.some(category => results[category]?.length > 0) : null
    }, [results])
    const hasActiveFilter = useMemo(() => filters ? Object.keys(filters).some(filter => filters[filter].active === true) : false, [filters])

    useEffect(() => {
        let value = input !== '' ? input : null
        setCookie(queryId.current, value)
    }, [input])

    useEffect(() => {
        setResults(getResults())
    }, [queryParam, filtersParam, config.space])

    function getResults() {
        if (config.space) {
            if (isSimple) {
                let newResults = []
                if (input === '' || (config.minimumLength && input.length < config.minimumLength)) {
                    newResults = getEmptyResults()
                    if (config.showAllOnInitial) {
                        newResults = filter(newResults)
                    }
                }
                else {
                    if (config.space.length > 0) {
                        let fuseParams = {
                            threshold: 0.15,
                            keys: config.keys,
                            minMatchCharLength: config.minimumLength ? config.minimumLength : 1,
                            ignoreLocation: true,
                        }
                        let fuse = new Fuse(config.space, fuseParams)
                        newResults = fuse.search(input).map(r => r.item)
                        newResults = filter(newResults).slice(0, config.limit)
                    }
                }
                return newResults
            }
            else {
                let newResults = {}
                if (input === '' || (config.minimumLength && input.length < config.minimumLength)) {
                    newResults = getEmptyResults()
                    if (config.showAllOnInitial) {
                        newResults = filter(newResults)
                        if (config.shape === 'array') {
                            newResults = newResults.flat(1)
                        }
                    }
                }
                else {
                    for (const category of config.categories) {
                        let fuseParams = {
                            threshold: 0.15,
                            keys: config.keys[category],
                            minMatchCharLength: config.minimumLength ? config.minimumLength : 1,
                            ignoreLocation: true,
                            ...(config.shape === 'array' ? { includeScore: true } : {})
                        }
                        let fuse = new Fuse(config.space[category], fuseParams)
                        newResults[category] = fuse.search(input)
                        if (config.shape !== 'array') {
                            newResults[category] = newResults[category].map(r => r.item)
                        }
                    }
                    if (config.shape === 'array') {
                        newResults = filter(Object.keys(newResults).map(c => newResults[c].map(r => { return { category: c, item: r.item, score: r.score} })).flat(1).sort((a, b) => a.score - b.score)).slice(0, config.limit).map(r => { return { category: r.category, item: r.item }})
                    }
                    else {
                        newResults = filter(newResults)
                        newResults = Object.fromEntries(Object.entries(newResults).map(([k, v]) => [k, v.slice(0, config.limit)]))
                    }
                }
                return newResults
            }
        }
    }

    function getEmptyResults() {
        if (isSimple || config.shape === 'array') {
            return config.showAllOnInitial && config.space ? config.space.slice(0, config.limit) : []
        }
        else {
            return config.showAllOnInitial && config.space ? Object.fromEntries(Object.entries(config.space).map(([k,]) => [k, config.space[k].slice(0, config.limit) ])) : {}
        }
    }

    function setFilter(filter, value) {
        let newFilters = {...filtersRef.current}
        newFilters[filter] = {...newFilters[filter], active: value}
        if (value === true && config.filters[filter].turnsOff) {
            for (const targetFilter of config.filters[filter].turnsOff) {
                newFilters[targetFilter] = {...newFilters[targetFilter], active: false}
            }
        }
        setCookie(filtersId.current, newFilters)
    }

    function setCookie(param, value) {
        if (value) {
            _setCookie(param, value)
        }
        else {
            _removeCookie(param)
        }
    }

    function filter(newResults) {
        let filteredResults = newResults
        if (config.filters && filtersRef.current) {
            for (const filter of Object.keys(config.filters)) {
                if (filtersRef.current[filter].active === true) {
                    if (filteredResults.constructor.name === 'Array') {
                        filteredResults = config.filters[filter].fn(filteredResults)
                    }
                    else {
                        for (const category of Object.keys(filteredResults)) {
                            filteredResults[category] = config.filters[filter].fn(filteredResults[category], category)
                        }
                    }
                }
            }
        }
        return filteredResults
    }

    return { input, onInputChange, results, hasResults, filters, hasActiveFilter, setFilter }
}

export { useSearch }