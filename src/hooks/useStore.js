import _ from 'lodash'
import { useEffect, useRef, useMemo} from 'react'
import { useCookies } from 'react-cookie'

function useStore(category, shape, defaults, options) {
    const storeName = useMemo(() => 'store_' + category, [category])
    const [cookies, setCookie,] = useCookies([storeName])
    let store = useMemo(() => cookies[storeName] ? cookies[storeName] : getEmptyStore(), [cookies[storeName]])
    const storeRef = useRef()
    storeRef.current = store

    useEffect(() => {
        if (!cookies[storeName]) {
            setCookie(storeName, getEmptyStore())
        }
    }, [cookies])

    function addToStore(category, value) {
        if (shape === 'array') {
            value = category
            if (options?.duplicates === false) {
                if (!(storeRef.current.some(item => _.isEqual(JSON.stringify(item), JSON.stringify(value))))) {
                    if (value.constructor.name === 'Array') {
                        setCookie(storeName, [...storeRef.current, ...value])
                    }
                    else {
                        setCookie(storeName, [...storeRef.current, value])
                    }
                }
            }
            else {
                setCookie(storeName, [...storeRef.current, value])
            }
        }
        else {
            if (storeRef.current[category]) {
                if (value.constructor.name === 'Array') {
                    setCookie(storeName, {...storeRef.current, [category]: [...storeRef.current[category], ...value]})
                }
                else {
                    setCookie(storeName, {...storeRef.current, [category]: [...storeRef.current[category], value]})
                }
            }
        }
    }

    function removeFromStore(category, value) {
        if (shape === 'array') {
            value = category
            let newStore = storeRef.current.filter(item => !(_.isEqual(JSON.stringify(item), JSON.stringify(value))))
            if (newStore.length > 0) {
                setCookie(storeName, newStore)
            }
            else {
                emptyStore()
            }
        }
        else {
            if (storeRef.current[category]) {
                let newStore = {...storeRef.current, [category]: storeRef.current[category].filter(item => !(_.isEqual(item, value)))}
                if (Object.keys(newStore).some(category => newStore[category].length > 0)) {
                    setCookie(storeName, {...storeRef.current, [category]: storeRef.current[category].filter(item => !(_.isEqual(JSON.stringify(item), JSON.stringify(value))))})
                }
                else {
                    emptyStore()
                }
            }
        }
    }

    function emptyStore() {
        setCookie(storeName, getEmptyStore())
    }

    function getEmptyStore() {
        return defaults ? defaults : shape === 'array' ? [] : {}
    }

    return [ store, addToStore, removeFromStore, emptyStore ]
}

export { useStore }