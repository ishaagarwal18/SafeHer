import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check both context and localStorage (handles page refresh)
  const hasUser = isAuthenticated || !!localStorage.getItem("user");

  if (!hasUser) {
    // Pass the attempted location so Login can redirect back after login
    // and show the "login required" message
    return (
      <Navigate
        to="/login"
        state={{ from: location, required: true }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
