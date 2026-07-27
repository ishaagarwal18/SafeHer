import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";

function VerifyOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("verify-otp/", { email, otp });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-card">
            <h1>📧 Verify Your Email</h1>
            <p>
                We've sent a 6-digit OTP to<br />
                <b>{email}</b>
            </p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="otp"
                    maxLength="6"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default VerifyOTP;
