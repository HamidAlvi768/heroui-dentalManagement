import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <main className="text-foreground bg-background">
        <App />
      </main>
    </HeroUIProvider>
  </React.StrictMode>,
)
