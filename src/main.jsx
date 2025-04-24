import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import App from './App'
import './index.css'
import { AuthProvider } from './auth/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <AuthProvider>
        <main className="text-foreground bg-background">
          <App />
        </main>
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>,
)
