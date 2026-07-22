/**
 * Purpose: Route guard — redirects unauthenticated users to /login
 * Responsibilities: Read AuthContext, render <Outlet /> if authenticated, else <Navigate />
 * Dependencies: react-router-dom, AuthContext
 * Export: ProtectedRoute
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from './routePaths';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
