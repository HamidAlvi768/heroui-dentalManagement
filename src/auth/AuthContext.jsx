import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))

  useEffect(() => {
    // Check localStorage for token on mount
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const login = (userData) => {
    // In a real app, you would validate credentials with your backend
    setUser(userData.user)
    setToken(userData.token)
    localStorage.setItem('authToken', userData.token)
    console.log(userData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
