import { memo, useEffect, useMemo, useState } from 'react'
import Page from '../components/page'
import { Helmet } from 'react-helmet'
import { useSearchParams } from 'react-router-dom'
import { useDatabase } from '../hooks/useDatabase'
import Conditional from '../components/conditional'
import Text from '../components/text'

const Info = memo(function Info() {
    let [searchParams,] = useSearchParams()
    let { getItem } = useDatabase()
    let category = useMemo(() => searchParams.get('category') ? searchParams.get('category') : null, [searchParams])
    let id = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])
    let [item, setItem] = useState()

    useEffect(() => {
        async function updateUser() {
            let { item } = await getItem(category, id)
            setItem(item)
        }

        updateUser()
    }, [category, id])

    let DOMId = 'info-'
    return (
        <Page>
            <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col'>
                <Helmet><title>{(item ? item.name : 'Info') + ' | Betsy'}</title></Helmet>
                <Conditional value = {item === null}>
                    <ErrorScreen category = {category} parentId = {DOMId}/>
                </Conditional>
            </div>
        </Page>
    )
})

const ErrorScreen = memo(function ErrorScreen({ category, parentId }) {
    let message = useMemo(() => {
        switch (category) {
            case 'events':
                return 'This event either does not exist, or has already ended.'
            case 'competitors':
                return 'This competitor does not exist.'
            case 'competitions':
                return 'This competition does not exist.'
            default:
                return 'This ' + category + ' cannot be found.'
        }
    }, [category])
    let DOMId = parentId + 'error-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full backdrop-blur-main z-20'>
            <div id = {DOMId + 'banner'} className = 'w-full h-min bg-primary-main rounded-main p-small !animate-duration-300 animate-slideInDown'>
                <Text id = {DOMId + 'message'} preset = 'info-error'>
                    {message}
                </Text>
            </div>
        </div>
    )
}, (b, a) => b.category === a.category)

export default Info