import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './i18n.ts'; // Import i18n configuration
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
