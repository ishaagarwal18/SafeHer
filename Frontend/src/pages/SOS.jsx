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
    const [message, setMessage] = useState("");

    useEffect(() => {
        dashboardApi.get("api/sos/")
            .then((res) => setAlerts(res.data))
            .catch(() => {});

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
        setMessage("");
        try {
            const res = await dashboardApi.post("api/sos/", { latitude, longitude, location });
            setAlerts((prev) => [res.data, ...prev]);
            setMessage("SOS alert sent!");
        } catch (_) {
            setMessage("Failed to send SOS.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <h1 className="page-title">Emergency SOS</h1>

                <div className="card">
                    <h2>Need Immediate Help?</h2>
                    <p>Press the button below to notify trusted contacts.</p>
                    <br />
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="latitude" value={latitude} readOnly />
                        <input type="hidden" name="longitude" value={longitude} readOnly />
                        <input type="hidden" name="location" value={location} readOnly />
                        <button className="btn" disabled={loading}>
                            {loading ? "Sending..." : "SEND SOS ALERT"}
                        </button>
                    </form>
                    {message && <p style={{ marginTop: "10px", fontWeight: "bold" }}>{message}</p>}
                </div>

                <div className="card">
                    <h2>SOS History</h2>
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
                                        <td>{new Date(alert.alert_time).toLocaleString()}</td>
                                        <td>{alert.status}</td>
                                        <td>{alert.location || "Unknown"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center" }}>No SOS Alerts</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nav-links">
                <Link to="/dashboard" className="btn">Back to Dashboard</Link>
            </div>
        </>
    );
}

export default SOS;