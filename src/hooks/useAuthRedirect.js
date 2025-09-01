import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getAuthToken } from '../utils/auth'

/**
 * Custom hook to handle authentication redirects
 * @param {boolean} requireAuth - Whether the component requires authentication
 * @param {string} redirectTo - Where to redirect if not authenticated (default: '/login')
 * @param {string} redirectIfAuth - Where to redirect if already authenticated (default: '/dashboard')
 */
export const useAuthRedirect = (requireAuth = true, redirectTo = '/login', redirectIfAuth = '/dashboard') => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    if (requireAuth && !isAuthenticated) {
      // User is not authenticated but component requires auth
      navigate(redirectTo, { replace: true })
    } else if (!requireAuth && isAuthenticated) {
      // User is authenticated but component doesn't require auth (e.g., login page)
      navigate(redirectIfAuth, { replace: true })
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, redirectIfAuth, navigate])

  return {
    isAuthenticated,
    isLoading,
    shouldRender: requireAuth ? isAuthenticated : !isAuthenticated
  }
}

/**
 * Hook to check if user has permission to access a route
 * @param {string[]} requiredRoles - Array of roles required to access the route
 * @param {string} redirectTo - Where to redirect if not authorized
 */
export const useAuthGuard = (requiredRoles = [], redirectTo = '/login') => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true })
      return
    }

    // Check if user has required roles
    if (requiredRoles.length > 0 && user) {
      const userRole = user.role || user.role_id
      if (!requiredRoles.includes(userRole)) {
        // User doesn't have required role, redirect to unauthorized page or dashboard
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, redirectTo, navigate])

  return {
    isAuthenticated,
    isLoading,
    hasPermission: requiredRoles.length === 0 || (user && requiredRoles.includes(user.role || user.role_id)),
    shouldRender: isAuthenticated && (requiredRoles.length === 0 || (user && requiredRoles.includes(user.role || user.role_id)))
  }
}

/**
 * Hook to handle logout with React Router navigation
 * @param {string} redirectTo - Where to redirect after logout (default: '/login')
 */
export const useLogout = (redirectTo = '/login') => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout() // This clears the auth data
    navigate(redirectTo, { replace: true }) // Use React Router to navigate
  }

  return { handleLogout }
}
