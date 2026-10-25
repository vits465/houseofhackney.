
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated, initialized } = useSelector(
    (state) => state.auth
  );

  const location = useLocation();

  // Wait until session restoration finishes.
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ec] text-[#171713]">
        <p className="font-serif text-lg">Restoring your session...</p>
      </div>
    );
  }

  // Redirect unauthenticated users to login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
