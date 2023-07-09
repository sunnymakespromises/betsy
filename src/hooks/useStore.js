import _ from 'lodash'
import { useEffect, useRef, useMemo} from 'react'
import { useCookies } from 'react-cookie'

function useStore(category, shape, defaults) {
    const storeName = useMemo(() => 'store_' + category, [category])
    const [cookies, setCookie,] = useCookies([storeName])
    let store = useMemo(() => cookies[storeName] ? cookies[storeName] : [], [cookies[storeName]])
    const storeRef = useRef()
    storeRef.current = store

    useEffect(() => {
        if (!cookies[storeName]) {
            setCookie(storeName, defaults ? defaults : shape === 'array' ? [] : {})
        }
    }, [cookies])

    function addToStore(category, value) {
        if (shape === 'array') {
            value = category
            setCookie(storeName, [...storeRef.current, value])
        }
        else {
            if (storeRef?.current[category]) {
                setCookie(storeName, {...storeRef.current, [category]: [...storeRef.current[category], value]})
            }
        }
    }

    function removeFromStore(category, value) {
        if (shape === 'array') {
            value = category
            setCookie(storeName, storeRef.current.filter(item => !(_.isEqual(item, value))))
        }
        else {
            if (storeRef?.current[category]) {
                setCookie(storeName, {...storeRef.current, [category]: storeRef.current[category].filter(item => !(_.isEqual(item, value)))})
            }
        }
    }

    return { store: storeRef.current, addToStore, removeFromStore }
}

export { useStore }