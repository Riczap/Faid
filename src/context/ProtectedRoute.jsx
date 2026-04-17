import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return children ? children : <Outlet />;
};
