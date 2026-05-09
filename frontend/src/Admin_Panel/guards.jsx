import { Navigate } from 'react-router-dom';
import { ADMIN_TOKEN_KEY, ADMIN_UNLOCK_SESSION_KEY } from './constants';

function hasUnlock() {
  try {
    return sessionStorage.getItem(ADMIN_UNLOCK_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** Login screen only reachable after shortcut unlock in this browser tab (session). */
export function AdminLoginGate({ children }) {
  if (!hasUnlock()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/** Dashboard requires Bearer token set after POST /admin/login. */
export function AdminProtectedRoute({ children }) {
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token?.trim()) {
      if (!hasUnlock()) return <Navigate to="/" replace />;
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }
  return children;
}
