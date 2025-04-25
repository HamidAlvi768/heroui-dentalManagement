import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider, ToastProvider } from "@heroui/react"
import App from './App'
import './index.css'
import { AuthProvider } from './auth/AuthContext'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastContainer />
      <AuthProvider>
        <main className="text-foreground bg-background">
          <App />
        </main>
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>,
)
