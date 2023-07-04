import { memo, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import Page from '../components/page'
import Profile from '../components/profile'

const User = memo(function User() {
    const [searchParams,] = useSearchParams()
    const userId = useMemo(() => searchParams.get('id') ? searchParams.get('id') : null, [searchParams])

    let DOMId = 'user-'
    return (
        <Page>
            <div id = {DOMId + 'page'} className = 'w-full h-full flex flex-col md:flex-row items-start gap-small'>
                <Helmet><title>User | Betsy</title></Helmet>
                <div id = {DOMId + 'group-1-container'} className = 'w-full md:w-min h-min md:h-full'>
                    <Profile userId = {userId} parentId = {DOMId}/>
                </div>
                <div id = {DOMId + 'group-2-container'} className = 'grow h-full'>

                </div>
            </div>
        </Page>
    )
})

export default User