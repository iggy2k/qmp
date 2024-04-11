import App from './App'
import Settings from './Settings'
import './index.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { HashRouter, Routes, Route } from 'react-router-dom'

import { createRoot } from 'react-dom/client'

const domNode = document.getElementById('root')
const root = createRoot(domNode as Element)

root.render(
    <HashRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="#/settings" element={<Settings />} />
            <Route path="*" element={<Settings />} />
        </Routes>
    </HashRouter>
)
