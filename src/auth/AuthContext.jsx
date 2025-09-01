import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { getAuthToken, validateTokenFormat, clearAuthData } from '../utils/auth.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(getAuthToken())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for token on mount
    const storedToken = getAuthToken()
    if (storedToken) {
      setToken(storedToken)
      // Validate token on mount
      validateToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateToken = useCallback(async (tokenToValidate) => {
    try {
      // Validate token format
      if (!validateTokenFormat(tokenToValidate)) {
        logout()
        return false
      }
      
      // Optional: Add API call to validate token with backend
      // const response = await api.get('/auth/validate', {
      //   headers: { Authorization: `Bearer ${tokenToValidate}` }
      // })
      
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      logout()
      return false
    }
  }, [])

  const login = useCallback((userData) => {
    // In a real app, you would validate credentials with your backend
    setUser(userData.user)
    setToken(userData.token)
    localStorage.setItem('authToken', userData.token)
    setIsLoading(false)
    console.log(userData)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setIsLoading(false)
    clearAuthData() // Only clear data, let component handle navigation
  }, [])

  const checkAuthStatus = useCallback(() => {
    const storedToken = getAuthToken()
    if (!storedToken) {
      logout()
      return false
    }
    return true
  }, [logout])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !isLoading,
    checkAuthStatus,
  }), [user, token, login, logout, isLoading, checkAuthStatus])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
