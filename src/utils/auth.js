// Authentication utility functions

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  return !!(token && token !== 'null' && token !== 'undefined')
}

/**
 * Get the current authentication token
 * @returns {string|null}
 */
export const getAuthToken = () => {
  const token = localStorage.getItem('authToken')
  return token && token !== 'null' && token !== 'undefined' ? token : null
}

/**
 * Clear authentication data (does not handle navigation)
 */
export const clearAuthData = () => {
  localStorage.removeItem('authToken')
}

/**
 * Clear authentication data and redirect to login
 */
export const clearAuthAndRedirect = () => {
  localStorage.removeItem('authToken')
  
  // Redirect to login page if not already there
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

/**
 * Validate token format (basic validation)
 * @param {string} token 
 * @returns {boolean}
 */
export const validateTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false
  if (token === 'null' || token === 'undefined' || token.trim() === '') return false
  return true
}

/**
 * Check if token is expired (if you have JWT tokens with expiry)
 * @param {string} token 
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) return true
    
    // If you're using JWT tokens, you can decode and check expiry
    // For now, we'll just check if token exists
    return false
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true
  }
}

/**
 * Refresh authentication status and redirect if needed
 */
export const refreshAuthStatus = () => {
  const token = getAuthToken()
  
  if (!token || isTokenExpired(token)) {
    clearAuthAndRedirect()
    return false
  }
  
  return true
}
