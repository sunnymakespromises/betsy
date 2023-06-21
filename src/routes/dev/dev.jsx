import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useRootContext } from '../../contexts/root'
import { DevProvider as Provider } from '../../contexts/dev'
import Page from '../../components/page'
import Conditional from '../../components/conditional'
import { Outlet } from 'react-router-dom'

export default function Dev() {
    const { currentUser } = useRootContext()
    const [isAdmin, setIsAdmin] = useState(false)
    const context = { isAdmin }

    useEffect(() => {
        if (currentUser && currentUser.is_admin) {
            setIsAdmin(true)
        }
    }, [currentUser])

    return (
        <Conditional value = {isAdmin}>
            <Provider value = {context}>
                <Page>
                    <div id = 'dev-page' className = 'w-full h-full flex flex-row gap-main'>
                        <Helmet><title>Dev | Betsy</title></Helmet>
                        <Outlet/>
                    </div>
                </Page>
            </Provider>
        </Conditional>
    )
}