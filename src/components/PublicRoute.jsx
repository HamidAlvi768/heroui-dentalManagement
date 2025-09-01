import React, { memo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import PageLoader from './PageLoader';

const PublicRoute = memo(({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }
  
  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
});

PublicRoute.displayName = 'PublicRoute';

export default PublicRoute;
