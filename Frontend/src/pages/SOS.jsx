import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function SOS() {
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [location, setLocation] = useState("");
    const [locationStatus, setLocationStatus] = useState({ state: "fetching", text: "Fetching your location, please wait..." });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const fetchAlerts = () => {
        dashboardApi.get("api/sos/")
            .then((res) => setAlerts(Array.isArray(res.data) ? res.data : []))
            .catch(() => {});
    };

    useEffect(() => {
        fetchAlerts();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setLatitude(lat);
                    setLongitude(lon);
                    setLocationStatus({ state: "ready", text: `✅ Location found (${lat.toFixed(4)}, ${lon.toFixed(4)}), resolving address...` });

                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`
                        );
                        const data = await res.json();
                        const a = data.address || {};
                        const parts = [
                            a.house_number ? `${a.house_number} ${a.road || ""}` : (a.road || a.pedestrian || a.footway || ""),
                            a.neighbourhood || a.suburb || a.quarter || a.residential || "",
                            a.village || a.town || a.city_district || a.county || a.city || "",
                            a.state || "",
                            a.postcode || ""
                        ].map((p) => p.trim()).filter(Boolean);
                        const address = parts.join(", ") || data.display_name || `${lat}, ${lon}`;
                        setLocation(address);
                        setLocationStatus({ state: "ready", text: `✅ Location ready — ${address}` });
                    } catch (_) {
                        const fallbackLoc = `${lat}, ${lon}`;
                        setLocation(fallbackLoc);
                        setLocationStatus({ state: "ready", text: `✅ Location ready — ${fallbackLoc}` });
                    }
                },
                () => {
                    setLocationStatus({ state: "error", text: "⚠️ Could not fetch location — SOS alert will be sent without location." });
                },
                { timeout: 10000 }
            );
        } else {
            setLocationStatus({ state: "error", text: "⚠️ Geolocation not supported by browser — SOS alert will be sent without location." });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await dashboardApi.post("api/sos/", { latitude, longitude, location });
            fetchAlerts();
            const msg = res.data?.message || "🚨 Emergency SOS alert & live location sent to your trusted contacts!";
            setMessage(msg);
            setMessageType("success");
        } catch (_) {
            setMessage("❌ Failed to send SOS alert. Please try again.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">🚨 Emergency SOS</h1>

                <div className="card">
                    <h2>Need Immediate Help?</h2>
                    <p style={{ marginBottom: "16px" }}>Press the button below to notify trusted contacts with your current location.</p>

                    <div
                        style={{
                            fontSize: "14px",
                            marginBottom: "16px",
                            padding: "12px 16px",
                            borderRadius: "10px",
                            background:
                                locationStatus.state === "ready"
                                    ? "#f0fff4"
                                    : locationStatus.state === "error"
                                    ? "#fff0f0"
                                    : "#fff8e1",
                            color:
                                locationStatus.state === "ready"
                                    ? "#276749"
                                    : locationStatus.state === "error"
                                    ? "#c0392b"
                                    : "#b8860b",
                            border: `1px solid ${
                                locationStatus.state === "ready"
                                    ? "#9ae6b4"
                                    : locationStatus.state === "error"
                                    ? "#ffb3b3"
                                    : "#ffe082"
                            }`,
                            fontWeight: "500"
                        }}
                    >
                        {locationStatus.text}
                    </div>

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
                            📍 Location Details
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
                        <input type="hidden" name="latitude" value={latitude} readOnly />
                        <input type="hidden" name="longitude" value={longitude} readOnly />
                        <button className="btn" type="submit" disabled={loading} style={{
                            background: "linear-gradient(135deg, #ff0044, #ff4f81)",
                            width: "100%",
                            padding: "16px",
                            fontSize: "17px",
                            letterSpacing: "1px"
                        }}>
                            {loading ? "SENDING EMERGENCY ALERT..." : "🚨 SEND SOS ALERT"}
                        </button>
                    </form>

                    {message && (
                        <div
                            style={{
                                marginTop: "16px",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                background: messageType === "success" ? "#e6fffa" : "#fff5f5",
                                color: messageType === "success" ? "#234e52" : "#9b2c2c",
                                border: `1px solid ${messageType === "success" ? "#81e6d9" : "#feb2b2"}`,
                                fontWeight: "bold"
                            }}
                        >
                            {message}
                        </div>
                    )}
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
                                            {alert.alert_time ? (typeof alert.alert_time === "string" ? alert.alert_time : new Date(alert.alert_time).toLocaleString()) : "Recent"}
                                        </td>
                                        <td>
                                            <span className="status-badge completed">
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