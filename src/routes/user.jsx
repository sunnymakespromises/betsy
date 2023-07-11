import { memo, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import Page from '../components/page'
import Profile from '../components/profile'

const User = memo(function User() {
    const [searchParams,] = useSearchParams()
    const userId = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])

    let DOMId = 'user'
    return (
        <Page DOMId = {DOMId}>
            <div id = {DOMId} className = 'w-full h-full flex flex-col md:flex-row'>
                <Helmet><title>User | Betsy</title></Helmet>
                <div id = {DOMId + '-group-1-container'} className = 'w-full h-min md:w-min md:h-full'>
                    <Profile userId = {userId} parentId = {DOMId} canEdit = {false}/>
                </div>
                <div id = {DOMId + '-group-2-container'} className = 'grow h-full'>

                </div>
            </div>
        </Page>
    )
})

export default User