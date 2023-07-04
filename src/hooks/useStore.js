import _ from 'lodash'
import { useCallback, useEffect, useRef, useState, useMemo} from 'react'
import { useCookies } from 'react-cookie'

function useStore(category) {
    const storeName = useMemo(() => 'store_' + category, [category])
    const [store, setStore] = useState()
    const storeRef = useRef()
    storeRef.current = store
    const [cookies, setCookie,] = useCookies([storeName])

    useEffect(() => {
        if (!cookies[storeName]) {
            setCookie(storeName, {})
        }
        else {
            if (!store) {
                setStore(cookies[storeName])
            }
        }
    }, [cookies])

    const addToStore = useCallback((category, value) => {
        if (storeRef?.current[category]) {
            setCookie(storeName, {...storeRef.current, [category]: [...storeRef.current[category], value]})
        }
    }, [store])

    const removeFromStore = useCallback((category, value) => {
        if (storeRef?.current[category]) {
            setCookie(storeName, {...storeRef.current, [category]: storeRef.current[category].filter(item => !(_.isEqual(item, value)))})
        }
    }, [store])

    return { store: storeRef.current, addToStore, removeFromStore }
}

export { useStore }