import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import api from "../services/api";

function maskEmail(email) {
    if (!email) return "your email";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const visible = local.slice(0, 2);
    const masked = "*".repeat(Math.max(local.length - 2, 3));
    return `${visible}${masked}@${domain}`;
}

function maskPhone(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 4) return phone;
    return "*".repeat(digits.length - 4) + digits.slice(-4);
}

function VerifyOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const stateData = location.state || {};
    const email = stateData.email || "";
    const phone = stateData.phone || "";

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
        <div className="auth-page">
        <div className="verify-card">
            <h1>📧 Verify Your Email</h1>
            <p className="subtitle">
                We've sent a 6-digit OTP to your registered email and phone number.
            </p>

            <div style={{
                background: "#fff0f5",
                border: "1px solid #ffc0cb",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                color: "#c0186a",
                margin: "10px 0 20px",
                lineHeight: "1.7"
            }}>
                📧 Email: <b>{maskEmail(email)}</b><br />
                {phone && <>📱 Phone: <b>{maskPhone(phone)}</b></>}
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="otp"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    autoComplete="one-time-code"
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
                    style={{ background: "none", border: "none", color: "#ff4f81", fontWeight: 600, cursor: "pointer", fontSize: "14px", padding: 0, width: "auto", marginTop: 0 }}
                >
                    {resending ? "Sending..." : "Resend OTP"}
                </button>
            </div>
        </div>
        </div>
    );
}

export default VerifyOTP;
