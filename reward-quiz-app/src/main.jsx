import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* UserProvider wraps the entire app to share user/points state globally */}
      <UserProvider>
        <App />
      </UserProvider>
    </HashRouter>
  </React.StrictMode>
)
