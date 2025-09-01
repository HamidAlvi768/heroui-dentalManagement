# Authentication System Setup

This document explains how the authentication system works in the dental management application and how to implement it in your components.

## Overview

The authentication system provides:
- Automatic token validation
- Protected routes
- Automatic redirection for unauthorized users
- Loading states during authentication checks
- Role-based access control (optional)

## Components

### 1. AuthContext (`src/auth/AuthContext.jsx`)

The main authentication context that manages:
- User authentication state
- Token management
- Login/logout functions
- Loading states

**Usage:**
```jsx
import { useAuth } from '../auth/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state and functions
}
```

### 2. Authentication Utilities (`src/utils/auth.js`)

Helper functions for authentication operations:
- `isAuthenticated()` - Check if user is authenticated
- `getAuthToken()` - Get current auth token
- `clearAuthAndRedirect()` - Clear auth and redirect to login
- `validateTokenFormat()` - Validate token format
- `refreshAuthStatus()` - Refresh authentication status

### 3. Authentication Hooks (`src/hooks/useAuthRedirect.js`)

Custom hooks for authentication handling:

#### `useAuthRedirect(requireAuth, redirectTo, redirectIfAuth)`
- `requireAuth`: Boolean indicating if component requires authentication
- `redirectTo`: Where to redirect if not authenticated (default: '/login')
- `redirectIfAuth`: Where to redirect if already authenticated (default: '/dashboard')

**Usage:**
```jsx
import { useAuthRedirect } from '../hooks/useAuthRedirect';

function LoginPage() {
  // Redirect to dashboard if already authenticated
  const { shouldRender } = useAuthRedirect(false, '/login', '/dashboard');
  
  if (!shouldRender) return null;
  
  return <div>Login Form</div>;
}
```

#### `useAuthGuard(requiredRoles, redirectTo)`
- `requiredRoles`: Array of roles required to access the route
- `redirectTo`: Where to redirect if not authorized

**Usage:**
```jsx
import { useAuthGuard } from '../hooks/useAuthRedirect';

function AdminPage() {
  // Only users with 'admin' role can access
  const { shouldRender, hasPermission } = useAuthGuard(['admin'], '/login');
  
  if (!shouldRender) return null;
  
  return <div>Admin Content</div>;
}
```

## Route Protection

### Private Routes
Routes that require authentication are wrapped with `PrivateRoute`:

```jsx
<Route
  path="/doctors"
  element={
    <PrivateRoute>
      <AppLayout>
        <DoctorsPage />
      </AppLayout>
    </PrivateRoute>
  }
/>
```

### Public Routes
Routes that don't require authentication are wrapped with `PublicRoute`:

```jsx
<Route
  path="/login"
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>
```

## Automatic Redirection

### 1. Unauthorized Access
When a user tries to access a protected route without authentication:
- Automatically redirected to `/login`
- Current page is replaced (no back button)

### 2. Already Authenticated
When an authenticated user tries to access public routes (like login):
- Automatically redirected to `/dashboard`
- Prevents authenticated users from seeing login page

### 3. Token Expiry/Invalidation
When API calls return 401/403 errors:
- Token is automatically cleared
- User is redirected to login page
- No manual intervention required

## Implementation in Components

### Protected Components
```jsx
import { useAuthGuard } from '../hooks/useAuthRedirect';

function ProtectedComponent() {
  const { shouldRender, isLoading } = useAuthGuard();
  
  if (!shouldRender) return null;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return <div>Protected Content</div>;
}
```

### Public Components
```jsx
import { useAuthRedirect } from '../hooks/useAuthRedirect';

function PublicComponent() {
  const { shouldRender } = useAuthRedirect(false);
  
  if (!shouldRender) return null;
  
  return <div>Public Content</div>;
}
```

## API Integration

### Automatic Token Handling
The axios configuration automatically:
- Adds the auth token to all requests
- Handles 401/403 responses by clearing auth and redirecting
- No need to manually add headers in API calls

### Manual Token Setting
```jsx
import { setAuthToken } from '../api/axios';

// Set token for API calls
setAuthToken(userToken);
```

## Loading States

The system provides loading states during:
- Initial authentication check
- Route transitions
- Authentication operations

**Example:**
```jsx
function MyComponent() {
  const { isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Authenticated Content</div>;
}
```

## Error Handling

### Authentication Errors
- Invalid tokens are automatically cleared
- Users are redirected to login
- Toast notifications for user feedback

### API Errors
- 401/403 responses trigger automatic logout
- Other errors are handled by individual components
- Centralized error handling in axios interceptors

## Security Features

1. **Token Validation**: Automatic format and structure validation
2. **Automatic Cleanup**: Invalid tokens are immediately cleared
3. **Route Protection**: All private routes are automatically protected
4. **Loading States**: Prevents flash of unauthorized content
5. **Automatic Redirects**: Seamless user experience

## Best Practices

1. **Always use hooks**: Use `useAuthRedirect` or `useAuthGuard` in components
2. **Handle loading states**: Show appropriate loading indicators
3. **Use PrivateRoute**: Wrap all protected routes
4. **Check permissions**: Use role-based guards for sensitive operations
5. **Error boundaries**: Implement error boundaries for better UX

## Troubleshooting

### Common Issues

1. **Infinite redirects**: Check that `useAuthRedirect` parameters are correct
2. **Loading forever**: Ensure `isLoading` state is properly managed
3. **Token not cleared**: Check that `clearAuthAndRedirect` is called properly

### Debug Mode

Enable debug logging by checking the browser console for:
- Authentication state changes
- Redirect operations
- Token validation results
- API error responses
