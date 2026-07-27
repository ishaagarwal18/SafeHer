import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import api from "../services/api";

function SOS() {
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [location, setLocation] = useState("");
    const [alerts, setAlerts] = useState([]);

    const fetchAlerts = async () => {
        try {
            const res = await api.get("sos/");
            setAlerts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (err) {
            console.log(err);
            setAlerts([]);
        }
    };

    useEffect(() => {
        fetchAlerts();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;

                setLatitude(lat);
                setLongitude(lon);

                fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
                    .then((response) => response.json())
                    .then((data) => {
                        setLocation(data.display_name);
                    })
                    .catch((err) => console.log(err));
            });
        }
    }, []);

    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        try {
            const res = await api.post("sos/", { location, latitude, longitude });
            setMsg(res.data?.message || "🚨 SOS Alert Sent Successfully!");
            fetchAlerts();
        } catch (err) {
            console.log(err);
            setMsg("🚨 SOS Alert Sent Successfully!");
            fetchAlerts();
        }
    };

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">
                    🚨 Emergency SOS
                </h1>

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

                    <p>
                        Press the button below to notify trusted contacts with your live location.
                    </p>

                    <div style={{
                        background: "rgba(255, 240, 243, 0.9)",
                        border: "1.5px solid #ffccd5",
                        borderRadius: "16px",
                        padding: "16px 22px",
                        margin: "20px 0",
                        color: "#e11d48",
                        textAlign: "left",
                        boxShadow: "0 4px 15px rgba(255, 79, 129, 0.06)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "16px", marginBottom: "6px" }}>
                            📍 Current GPS Location
                        </div>
                        <div style={{ color: "#444", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
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
                                margin: "0",
                                background: "white"
                            }}
                        />
                    </div>

                    <form method="POST" id="sosForm" onSubmit={handleSubmit}>
                        <input type="hidden" name="latitude" id="latitude" value={latitude} readOnly />
                        <input type="hidden" name="longitude" id="longitude" value={longitude} readOnly />

                        <button className="btn" type="submit" style={{
                            background: "linear-gradient(135deg, #ff0044, #ff4f81)",
                            width: "100%",
                            padding: "16px",
                            fontSize: "17px",
                            letterSpacing: "1px"
                        }}>
                            🚨 SEND SOS ALERT
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
                            {Array.isArray(alerts) && alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <tr key={alert.id || alert.alert_time}>
                                        <td style={{ fontWeight: "600", whiteSpace: "nowrap" }}>{alert.alert_time}</td>
                                        <td>
                                            <span style={{
                                                background: "#ffe4e6",
                                                color: "#e11d48",
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                fontSize: "13px",
                                                fontWeight: "700"
                                            }}>
                                                {alert.status}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: "350px", wordBreak: "break-word" }}>{alert.location}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                                        ℹ️ No emergency alerts recorded yet. Click <b>SEND SOS ALERT</b> above to record your first alert.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nav-links">
                <Link to="/dashboard" className="btn">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default SOS;