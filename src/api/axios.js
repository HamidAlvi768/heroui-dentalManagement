import axios from 'axios'
import { config } from '../config/config.js'
import { getAuthToken, clearAuthData } from '../utils/auth.js'

const api = axios.create({
  baseURL: config.baseurl,  // Use your actual API URL here
  headers: { 'Content-Type': 'application/json' }
})

// Create a function that sets the token dynamically for each request
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers['Authorization']
  }
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized responses
      if (error.response.status === 401) {
        clearAuthData() // Only clear data
        // Dispatch custom event for components to handle navigation
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { status: 401 } }))
      }
      
      // Handle 403 Forbidden responses
      if (error.response.status === 403) {
        clearAuthData() // Only clear data
        // Dispatch custom event for components to handle navigation
        window.dispatchEvent(new CustomEvent('auth:forbidden', { detail: { status: 403 } }))
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
