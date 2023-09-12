import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Settings from './Settings'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        // element: <Settings />,
    },
    {
        path: '/settings',
        element: <Settings />,
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
    // <App />
    // <React.StrictMode>
    //   <App />
    // </React.StrictMode>,
)
