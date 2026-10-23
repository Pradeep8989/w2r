import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import { storageService } from '../../services/storageService';

interface ProtectedRouteProps {
  allowedRole: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const location = useLocation();
  const currentUser = storageService.getCurrentUser();

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user role does not match the portal's allowed role, redirect to user's assigned portal
  if (currentUser.role !== allowedRole) {
    const targetPath =
      currentUser.role === 'customer'
        ? '/customer'
        : currentUser.role === 'recycler'
        ? '/recycler'
        : '/admin';
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};
