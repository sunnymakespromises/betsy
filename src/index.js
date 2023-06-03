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
    <GoogleOAuthProvider clientId = '1075586122703-gpv4qeqdi0igs4pshrb6i8rorhi1ubk8.apps.googleusercontent.com'>
        <CookiesProvider>
            <RouterProvider router = {router}/>
        </CookiesProvider>
    </GoogleOAuthProvider>
)