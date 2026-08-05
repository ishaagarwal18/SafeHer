import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("login/", form);
            // Store user info and update AuthContext
            if (login) login(res.data.user);
            else localStorage.setItem("user", JSON.stringify(res.data.user));

            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-card">
            <h1>Welcome Back</h1>
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
                    <p style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
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
    );
}

export default Login;
