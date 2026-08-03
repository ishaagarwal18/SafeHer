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
  const [gpsStatus, setGpsStatus] = useState("Acquiring GPS location...");

  useEffect(() => {
    dashboardApi
      .get("api/sos/")
      .then((res) => setAlerts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);
          setGpsStatus(`📍 Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();
            if (data.display_name) {
              setLocation(data.display_name);
              setGpsStatus(`📍 ${data.display_name}`);
            }
          } catch (_) {}
        },
        () => {
          setGpsStatus("⚠️ Location access denied. Defaulting to estimated area.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsStatus("⚠️ Geolocation unsupported by browser.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await dashboardApi.post("api/sos/", { latitude, longitude, location });
      setAlerts((prev) => [res.data, ...prev]);
      setMessage("✅ Emergency SOS alert dispatched to all trusted contacts & email!");
    } catch (_) {
      setMessage("⚠️ Failed to send SOS alert. Please call emergency services (112) immediately.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">🚨 Emergency SOS Dispatch</h1>

      {/* Panic Button Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
          border: "2px solid #ef4444",
          textAlign: "center",
          padding: "36px 24px"
        }}
      >
        <h2 style={{ color: "#991b1b", fontSize: "24px", justifyContent: "center" }}>
          Need Immediate Emergency Assistance?
        </h2>
        <p style={{ color: "#7f1d1d", fontSize: "15px", maxWidth: "600px", margin: "8px auto 24px" }}>
          Tapping the panic button sends your live GPS coordinates & automated email/SMS alert to all your registered trusted contacts.
        </p>

        <div style={{ margin: "20px 0" }}>
          <form onSubmit={handleSubmit}>
            <button
              className="btn btn-danger"
              disabled={loading}
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                fontSize: "20px",
                fontWeight: "900",
                letterSpacing: "1px",
                boxShadow: "0 0 40px rgba(239, 68, 68, 0.5), 0 10px 25px rgba(220, 38, 38, 0.4)",
                border: "6px solid #ffffff",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              <span style={{ fontSize: "48px" }}>🚨</span>
              <span>{loading ? "SENDING..." : "TRIGGER SOS"}</span>
            </button>
          </form>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 20px",
            display: "inline-block",
            border: "1px solid #fca5a5",
            marginTop: "12px"
          }}
        >
          <span style={{ fontSize: "13.5px", color: "#991b1b", fontWeight: "700" }}>{gpsStatus}</span>
        </div>

        {message && (
          <div
            className={`alert-box ${message.includes("✅") ? "alert-success" : "alert-danger"}`}
            style={{ maxWidth: "600px", margin: "20px auto 0", justifyContent: "center" }}
          >
            <p style={{ fontWeight: "700", margin: 0 }}>{message}</p>
          </div>
        )}
      </div>

      {/* Emergency Hotlines Quick Call */}
      <div className="card">
        <h2>📞 Direct Emergency Dial Numbers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "16px" }}>
          <a href="tel:112" className="btn btn-danger" style={{ padding: "14px", fontSize: "15px" }}>
            📞 112 National Emergency
          </a>
          <a
            href="tel:1091"
            className="btn"
            style={{ padding: "14px", fontSize: "15px", background: "linear-gradient(135deg, #db2777, #be123c)" }}
          >
            👩 1091 Women Helpline
          </a>
          <a href="tel:100" className="btn btn-secondary" style={{ padding: "14px", fontSize: "15px" }}>
            👮 100 Police Control
          </a>
          <a href="tel:108" className="btn btn-secondary" style={{ padding: "14px", fontSize: "15px" }}>
            🚑 108 Medical Emergency
          </a>
        </div>
      </div>

      {/* SOS History Table Card */}
      <div className="card">
        <h2>📜 SOS Alert Dispatch History</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Status</th>
              <th>Location</th>
              <th>Live Map Link</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <tr key={alert.id || i}>
                  <td>
                    <strong>{new Date(alert.alert_time).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className="status-pill warning">{alert.status || "Sent"}</span>
                  </td>
                  <td>{alert.location || "Unknown location"}</td>
                  <td>
                    {alert.latitude && alert.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm"
                      >
                        🗺 View Location
                      </a>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>N/A</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                  No SOS Alerts Triggered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default SOS;