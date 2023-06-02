import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import './index.css'
import routes from './routes/routes'

const router = createBrowserRouter(routes)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <CookiesProvider>
            <RouterProvider router = {router}/>
        </CookiesProvider>
    </React.StrictMode>
)