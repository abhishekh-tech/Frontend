import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole && user.role !== 'admin') {
    // Redirect to home/explore if role doesn't match and user is not an admin
    console.warn(`Access denied: Required role ${allowedRole}, but user has role ${user.role}`);
    return <Navigate to="/explore" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
