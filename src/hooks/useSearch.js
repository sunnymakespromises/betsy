import { useEffect, useMemo, useRef, useState } from 'react'
import _ from 'lodash'
import { useInput } from './useInput'
import Fuse from 'fuse.js'
import { useSearchParams } from 'react-router-dom'

function useSearch(options) {
    const [config, setConfig] = useState(options)
    const isSimple = !(config.categories)
    const [searchParams, setSearchParams] = useSearchParams()
    const searchParamsRef = useRef()
    searchParamsRef.current = searchParams
    const queryParam = useMemo(() => searchParams.get('query'), [searchParams])
    const filtersParam = useMemo(() => searchParams.get('filters'), [searchParams])
    const filters = useMemo(() => {
        let newFilters = {}
        let newFiltersParam = filtersParam?.split(',')
        Object.keys(config.filters).forEach(filter => newFilters[filter] = {...config.filters[filter], active: newFiltersParam ? newFiltersParam.includes(filter) : false})
        return newFilters
    }, [searchParams])
    const filtersRef = useRef()
    filtersRef.current = filters
    const {input, onInputChange} = useInput(null, queryParam ? queryParam : '')
    const [results, setResults] = useState()
    const hasResults = useMemo(() => config.shape === 'array' ? results && results.length > 0 : results && Object.keys(results)?.some(category => results[category].length > 0), [results])

    useEffect(() => {
        let value = input !== '' ? input : null
        setSearchParam('query', value)
    }, [input])

    useEffect(() => {
        if (config.space) {
            if (isSimple) {
                let newResults = []
                if (input === '' || (config.minimumLength && input.length < config.minimumLength)) {
                    newResults = getEmptyResults()
                }
                else {
                    if (config.space.length > 0) {
                        let fuseParams = {
                            threshold: 0.05,
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
                }
                else {
                    for (const category of config.categories) {
                        let fuseParams = {
                            threshold: 0.05,
                            keys: config.keys[category],
                            minMatchCharLength: config.minimumLength ? config.minimumLength : 1
                        }
                        let fuse = new Fuse(config.space[category], fuseParams)
                        newResults[category] = fuse.search(input).map(r => r.item)
                        if (config.shape !== 'array') {
                            newResults[category] = filter(newResults[category].map(r => { return { category: category, item: r } })).slice(0, config.limit)
                        }
                    }
                    if (config.shape === 'array') {
                        newResults = filter(Object.keys(newResults).map(c => newResults[c].map(r => { return { category: c, item: r } })).flat(1)).slice(0, config.limit)
                    }
                }
                setResults(newResults)
            }
        }
    }, [queryParam, filtersParam])
    
    useEffect(() => {
        let changes = Object.keys(options).filter(option => !(_.isEqual(options[option], config[option])))
        if (changes.length > 0) {
            let newConfig = {...config}
            for (const change of changes) {
                newConfig[change] = options[change]
            }
            setConfig(newConfig)
        }
    }, [options])

    function loadSpace(data) {
        let newConfig = {...config}
        newConfig.space = data
        setConfig(newConfig)
    }

    function getEmptyResults() {
        if (isSimple || config.shape === 'array') {
            return []
        }
        else {
            return {}
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
        setSearchParam('filters', value)
    }

    function setSearchParam(param, value) {
        let newSearchParams = {...Object.fromEntries(value ? [...searchParamsRef.current, [param, value]] : [...searchParamsRef.current].filter(p => p[0] !== param))}
        setSearchParams(newSearchParams, { replace: true })
    }

    function filter(newResults) {
        let filteredResults = newResults
        if (config.filters && filtersRef?.current) {
            for (const filter of Object.keys(config.filters)) {
                if (filtersRef.current[filter].active === true) {
                    filteredResults = config.filters[filter]?.fn(filteredResults)
                }
            }
        }
        return filteredResults
    }

    return { input, onInputChange, results, hasResults, filters, setFilter, loadSpace }
}

export { useSearch }