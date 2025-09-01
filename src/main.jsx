import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from "@heroui/react"
import App from './App'
import './index.css'
import { AuthProvider } from './auth/AuthContext'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

ReactDOM.createRoot(document.getElementById('root')).render(
  isDevelopment ? (
    <React.StrictMode>
      <HeroUIProvider>
        <ToastContainer />
        <AuthProvider>
          <main className="text-foreground bg-background">
            <App />
          </main>
        </AuthProvider>
      </HeroUIProvider>
    </React.StrictMode>
  ) : (
    <HeroUIProvider>
      <ToastContainer />
      <AuthProvider>
        <main className="text-foreground bg-background">
          <App />
        </main>
      </AuthProvider>
    </HeroUIProvider>
  )
)
