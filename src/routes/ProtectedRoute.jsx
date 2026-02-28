import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // Wait for AuthContext to load user from localStorage
  if (loading) return null;

  // Not logged in → back to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role not allowed → back to login
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}