import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("send-otp/", form);
            navigate("/verify-email", {
                state: {
                    email: form.email,
                    name: form.name,
                    phone: form.phone,
                    password: form.password,
                    otp: res.data?.otp
                }
            });
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
<<<<<<< HEAD
        <div className="auth-page">
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
        <div className="auth-card">
            <div className="logo">🛡</div>
            <h1>Create Your Account</h1>
            <p className="subtitle">Join SafeHer and make every journey safer.</p>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="text" name="phone" maxLength="10" placeholder="Mobile Number" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="password" name="confirm_password" placeholder="Confirm Password" value={form.confirm_password} onChange={handleChange} required />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                </button>
            </form>
            <div className="extra">
                Already have an account? <Link to="/login">Login</Link>
            </div>
        </div>
<<<<<<< HEAD
        </div>
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
    );
}

export default Signup;
