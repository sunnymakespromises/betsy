import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import routes from './routes/routes'

const router = createBrowserRouter(routes)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <GoogleOAuthProvider clientId = {process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}>
        <CookiesProvider>
            <RouterProvider router = {router}/>
        </CookiesProvider>
    </GoogleOAuthProvider>
)