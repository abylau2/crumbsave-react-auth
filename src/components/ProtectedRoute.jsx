import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AuthLoading() {
  return <div className="container page-state" role="status"><p className="eyebrow">ONE MOMENT</p><h1>Checking your session…</h1></div>;
}

// Wrap routes that need a signed-in user. Unauthenticated visitors are sent to
// /login and returned to the page they asked for after signing in.
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  return <Outlet />;
}

// Login and signup make no sense for someone who is already signed in.
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (user) {
    const from = location.state?.from;
    return <Navigate to={typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/profile'} replace />;
  }
  return children;
}
