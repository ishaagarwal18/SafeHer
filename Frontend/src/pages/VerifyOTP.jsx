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
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
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

    const handleResend = async () => {
        setError("");
        setSuccess("");
        setResending(true);
        try {
            await api.post("resend-otp/", { email });
            setSuccess("A new OTP has been sent to your email.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to resend OTP. Please try again.");
        } finally {
            setResending(false);
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
            {success && <p style={{ color: "#2e7d32", marginTop: "12px", fontSize: "14px" }}>{success}</p>}
            <div className="resend" style={{ marginTop: "20px" }}>
                Didn't receive the OTP?<br />
                <button
                    onClick={handleResend}
                    disabled={resending}
                    style={{ background: "none", border: "none", color: "#ff4f81", fontWeight: 600, cursor: "pointer", fontSize: "14px", padding: 0 }}
                >
                    {resending ? "Sending..." : "Resend OTP"}
                </button>
            </div>
        </div>
    );
}

export default VerifyOTP;
