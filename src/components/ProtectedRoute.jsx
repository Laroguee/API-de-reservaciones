// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />; // Renderiza el componente hijo (la página protegida)
};

export default ProtectedRoute;