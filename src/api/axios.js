import axios from 'axios'
import { useAuth } from '../auth/AuthContext.jsx'
import { config } from '../utills/config.js'

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

export default api
