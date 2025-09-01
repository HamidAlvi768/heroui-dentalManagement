import React, { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import PageLoader from './PageLoader';

const PrivateRoute = memo(({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
});

PrivateRoute.displayName = 'PrivateRoute';

export default PrivateRoute;
