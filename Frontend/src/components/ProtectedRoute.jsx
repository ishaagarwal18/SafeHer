import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

<<<<<<< HEAD
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
=======
  if (!isAuthenticated && !localStorage.getItem("user")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
  }

  return children;
}

export default ProtectedRoute;
