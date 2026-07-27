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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
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
            setError(err.response?.data?.error || "Invalid OTP");
        }
    };

    return (
        <div className="auth-page">
            <div className="verify-card">
                <h1>📧 Verify Your Email</h1>

                <p>
                    We've sent a 6-digit OTP to
                    <br />
                    <b>{email}</b>
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
                        type="hidden"
                        name="email"
                        value={email}
                        readOnly
                    />

                    <input
                        type="text"
                        name="otp"
                        maxLength="6"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Verify OTP
                    </button>
                </form>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <div className="resend">
                    Didn't receive the OTP?
                    <br />
                    <a href="#" onClick={(e) => { e.preventDefault(); api.post("send-otp/", { email }); }}>
                        Resend OTP
                    </a>
                </div>
            </div>
        </div>
    );
}

export default VerifyOTP;
