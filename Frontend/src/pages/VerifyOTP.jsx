import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";

function VerifyOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const email = stateData.email || "";

    const [otp, setOtp] = useState(stateData.otp || "");
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
            await api.post("verify-otp/", {
                email,
                otp,
                name: stateData.name,
                phone: stateData.phone,
                password: stateData.password,
            });
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
<<<<<<< HEAD
        <div className="auth-page">
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
        <div className="verify-card">
            <h1>📧 Verify Your Email</h1>
            <p>
                We've sent a 6-digit OTP to<br />
                <b>{email || "your email"}</b>
            </p>
            {stateData.otp && (
                <div style={{
                    background: "#eef2ff",
                    border: "1px solid #c7d2fe",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "#3730a3",
                    margin: "15px 0 20px"
                }}>
                    ℹ️ <b>Your OTP: {stateData.otp}</b> (Auto-filled below)
                </div>
            )}
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
<<<<<<< HEAD
                    style={{ background: "none", border: "none", color: "#ff4f81", fontWeight: 600, cursor: "pointer", fontSize: "14px", padding: 0, width: "auto", marginTop: 0 }}
=======
                    style={{ background: "none", border: "none", color: "#ff4f81", fontWeight: 600, cursor: "pointer", fontSize: "14px", padding: 0 }}
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
                >
                    {resending ? "Sending..." : "Resend OTP"}
                </button>
            </div>
        </div>
<<<<<<< HEAD
        </div>
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
    );
}

export default VerifyOTP;
