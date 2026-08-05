import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Journey from "./pages/Journey";
<<<<<<< HEAD
import JourneyHistory from "./pages/JourneyHistory";
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
import History from "./pages/History";
import SOS from "./pages/SOS";
import SOSHistory from "./pages/SOSHistory";
import SafePlaces from "./pages/SafePlaces";
import Report from "./pages/Report";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyOTP />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journey"
          element={
            <ProtectedRoute>
              <Journey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
<<<<<<< HEAD
          path="/journey-history"
          element={
            <ProtectedRoute>
              <JourneyHistory />
            </ProtectedRoute>
          }
        />
        <Route
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
          path="/sos"
          element={
            <ProtectedRoute>
              <SOS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sos/history"
          element={
            <ProtectedRoute>
              <SOSHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safe-places"
          element={
            <ProtectedRoute>
              <SafePlaces />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;