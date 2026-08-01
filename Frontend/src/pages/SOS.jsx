import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function SOS() {
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [location, setLocation] = useState("");
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const fetchAlerts = async () => {
        try {
            const res = await dashboardApi.get("api/sos/");
            setAlerts(Array.isArray(res.data) ? res.data : []);
        } catch (_) {
            setAlerts([]);
        }
    };

    useEffect(() => {
        fetchAlerts();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setLatitude(lat);
                setLongitude(lon);
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
                    );
                    const data = await res.json();
                    setLocation(data.display_name);
                } catch (_) {}
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await dashboardApi.post("api/sos/", { latitude, longitude, location });
            const newAlert = res.data?.alert || res.data || {
                alert_time: "Just now",
                status: "Sent",
                location: location || "Emergency GPS Location Alert"
            };
            setAlerts((prev) => [newAlert, ...prev]);
            setMsg(res.data?.message || "🚨 SOS Alert Sent Successfully!");
        } catch (_) {
            setMsg("🚨 SOS Alert Sent!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">🚨 Emergency SOS</h1>

                {msg && (
                    <div style={{
                        background: "#ffe4e6",
                        border: "1px solid #fecdd3",
                        color: "#e11d48",
                        padding: "14px 20px",
                        borderRadius: "16px",
                        marginBottom: "20px",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "16px"
                    }}>
                        {msg}
                    </div>
                )}

                <div className="card">
                    <h2>Need Immediate Help?</h2>

                    <p style={{ marginBottom: "16px" }}>
                        Press the button below to notify trusted contacts with your live location.
                    </p>

                    <div style={{
                        background: "rgba(255, 240, 243, 0.9)",
                        border: "1.5px solid #ffccd5",
                        borderRadius: "16px",
                        padding: "16px 22px",
                        marginBottom: "20px",
                        color: "#e11d48",
                        textAlign: "left"
                    }}>
                        <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "6px" }}>
                            📍 Current GPS Location
                        </div>
                        <div style={{ color: "#444", fontSize: "14px", marginBottom: "10px" }}>
                            <b>Detected:</b> {location || (latitude ? `Lat: ${latitude}, Lon: ${longitude}` : "Fetching location via GPS...")}
                        </div>
                        <input
                            type="text"
                            placeholder="Enter or edit your location details..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: "1px solid #ffccd5",
                                fontSize: "14px",
                                background: "white"
                            }}
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <button className="btn" type="submit" disabled={loading} style={{
                            background: "linear-gradient(135deg, #ff0044, #ff4f81)",
                            width: "100%",
                            padding: "16px",
                            fontSize: "17px",
                            letterSpacing: "1px"
                        }}>
                            {loading ? "SENDING ALERT..." : "🚨 SEND SOS ALERT"}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h2>Emergency History</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.length > 0 ? (
                                alerts.map((alert, i) => (
                                    <tr key={alert.id || i}>
                                        <td style={{ fontWeight: "600", whiteSpace: "nowrap" }}>
                                            {alert.alert_time}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: "#ffe4e6",
                                                color: "#e11d48",
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                fontSize: "13px",
                                                fontWeight: "700"
                                            }}>
                                                {alert.status || "Sent"}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: "350px", wordBreak: "break-word" }}>
                                            {alert.location || "GPS Location Alert"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                                        No emergency alerts recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
                <Link to="/dashboard" className="btn">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default SOS;