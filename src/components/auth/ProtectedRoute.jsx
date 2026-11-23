import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)] font-mono tracking-wider">
            AUTHENTICATING...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
