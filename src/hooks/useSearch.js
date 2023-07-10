import { useEffect, useMemo, useRef, useState } from 'react'
import { useInput } from './useInput'
import Fuse from 'fuse.js'
import { useSearchParams } from 'react-router-dom'

function useSearch(config) {
    const isSimple = !(config.categories)
    const [searchParams, setSearchParams] = useSearchParams()
    const searchParamsRef = useRef()
    searchParamsRef.current = searchParams
    const queryId = config.id + '_query'
    const queryParam = useMemo(() => searchParams.get(queryId), [searchParams])
    const filtersId = config.id + '_filters'
    const filtersParam = useMemo(() => searchParams.get(filtersId), [searchParams])
    const filters = useMemo(() => {
        if (config.filters) {
            let newFilters = {}
            let newFiltersParam = filtersParam?.split(',')
            Object.keys(config.filters).forEach(filter => newFilters[filter] = {...config.filters[filter], active: newFiltersParam ? newFiltersParam.includes(filter) : false})
            return newFilters
        }
        else {
            return null
        }
    }, [searchParams])
    const filtersRef = useRef()
    filtersRef.current = filters
    const {input, onInputChange} = useInput(null, queryParam ? queryParam : '')
    const [results, setResults] = useState()
    const hasResults = useMemo(() => input !== '' ? config.shape === 'array' ? results && results.length > 0 : results && Object.keys(results)?.some(category => results[category].length > 0) : null, [results])

    useEffect(() => {
        let value = input !== '' ? input : null
        setSearchParam(queryId, value)
    }, [input])


    useEffect(() => {
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
                            minMatchCharLength: config.minimumLength ? config.minimumLength : 1
                        }
                        let fuse = new Fuse(config.space, fuseParams)
                        newResults = fuse.search(input).map(r => r.item)
                        newResults = filter(newResults).slice(0, config.limit)
                    }
                }
                setResults(newResults)
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
                            minMatchCharLength: config.minimumLength ? config.minimumLength : 1
                        }
                        let fuse = new Fuse(config.space[category], fuseParams)
                        newResults[category] = fuse.search(input).map(r => r.item)
                    }
                    if (config.shape === 'array') {
                        newResults = filter(Object.keys(newResults).map(c => newResults[c].map(r => { return { category: c, item: r } })).flat(1)).slice(0, config.limit)
                    }
                    else {
                        newResults = filter(newResults)
                        newResults = Object.fromEntries(Object.entries(newResults).map(([k, v]) => [k, v.slice(0, config.limit)]))
                    }
                }
                setResults(newResults)
            }
        }
    }, [queryParam, filtersParam, config.space])

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
        setFilterParams(newFilters)
    }

    function setFilterParams(newFilters) {
        let value = Object.keys(newFilters).some(f => newFilters[f].active === true) ? Object.keys(newFilters).filter(filter => newFilters[filter].active === true).join(',') : null
        setSearchParam(filtersId, value)
    }

    function setSearchParam(param, value) {
        let newSearchParams = {...Object.fromEntries(value ? [...searchParamsRef.current, [param, value]] : [...searchParamsRef.current].filter(p => p[0] !== param))}
        setSearchParams(newSearchParams, { replace: true })
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

    return { input, onInputChange, results, hasResults, filters, setFilter }
}

export { useSearch }