import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * AdminProtectedRoute
 * Secures all /admin/* routes. Verifies authentication and active token.
 * Unauthenticated users are redirected to /login with return location preserved.
 */
export default function AdminProtectedRoute() {
  const { isAuthenticated, token, initialized } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  // If auth is still restoring from session, display elegant atelier loader
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f4] text-[#142617]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#3e7b52]/30 border-t-[#3e7b52] animate-spin" />
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#526956] font-semibold">
            Verifying Atelier Security Credentials...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or has no valid access token, redirect to login
  if (!isAuthenticated || !token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // User is authenticated
  return <Outlet />;
}
