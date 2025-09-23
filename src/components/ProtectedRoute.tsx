import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ role }: { role?: import("@/context/AuthContext").Role }) {
  const { user } = useAuth();
  const location = useLocation();
  // If not logged in or wrong role, send the user to login with context so the correct tab opens
  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, roleRequired: role }}
      />
    );
  if (role && user.role !== role)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, roleRequired: role }}
      />
    );
  return <Outlet />;
}
