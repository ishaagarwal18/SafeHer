import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Where to go after a successful login — default /dashboard
  const from = location.state?.from?.pathname || "/dashboard";
  // Show message when redirected from a protected page (direct URL or nav)
  const loginRequired = !!location.state?.required || !!location.state?.from;

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("login/", form);
      login(res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>

        {/* Show banner when user tried to access a protected page */}
        {loginRequired && (
          <div style={{
            background: "#fff0f5",
            border: "1.5px solid #ff4f81",
            color: "#c0164f",
            padding: "13px 16px",
            borderRadius: "14px",
            marginBottom: "18px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
            🔒 Login required — please sign in to access this page
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "15px", textAlign: "center", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="extra">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
