import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function SOS() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [location, setLocation] = useState("");
  const [locationStatus, setLocationStatus] = useState({
    state: "fetching",
    text: "Fetching your location, please wait..."
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAlerts = () => {
    dashboardApi
      .get("api/sos/")
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
          setLocationStatus({
            state: "ready",
            text: `✅ Location found (${lat.toFixed(4)}, ${lon.toFixed(4)}), resolving address...`
          });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`
            );
            const data = await res.json();
            const a = data.address || {};
            const parts = [
              a.house_number ? `${a.house_number} ${a.road || ""}` : a.road || a.pedestrian || a.footway || "",
              a.neighbourhood || a.suburb || a.quarter || a.residential || "",
              a.village || a.town || a.city_district || a.county || a.city || "",
              a.state || "",
              a.postcode || ""
            ]
              .map((p) => p.trim())
              .filter(Boolean);
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
          setLocationStatus({
            state: "error",
            text: "⚠️ Could not fetch location — SOS alert will be sent without location."
          });
        },
        { timeout: 10000 }
      );
    } else {
      setLocationStatus({
        state: "error",
        text: "⚠️ Geolocation not supported by browser — SOS alert will be sent without location."
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await dashboardApi.post("api/sos/", { latitude, longitude, location });
      fetchAlerts();
      setMessage(res.data?.message || "🚨 Emergency SOS alert sent to your trusted contacts!");
    } catch (_) {
      setMessage("❌ Failed to send SOS alert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="page-title">🚨 Emergency SOS</h1>

        <div className="card">
          <h2>Need Immediate Help?</h2>
          <p>Press the button below to notify trusted contacts.</p>
          <br />

          <div
            style={{
              fontSize: "13px",
              marginBottom: "14px",
              padding: "10px 14px",
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

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="latitude" value={latitude} readOnly />
            <input type="hidden" name="longitude" value={longitude} readOnly />
            <input type="hidden" name="location" value={location} readOnly />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "SENDING SOS..." : "SEND SOS ALERT"}
            </button>
          </form>

          {message && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: message.includes("🚨") ? "#f0fff4" : "#fff0f0",
                color: message.includes("🚨") ? "#276749" : "#c0392b",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              {message}
            </div>
          )}
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
                    <td>
                      {alert.alert_time
                        ? typeof alert.alert_time === "string"
                          ? alert.alert_time
                          : new Date(alert.alert_time).toLocaleString()
                        : "Recent"}
                    </td>
                    <td>
                      <span className="status-pill completed">{alert.status || "Sent"}</span>
                    </td>
                    <td>{alert.location || "Unknown"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", color: "#aaa", fontStyle: "italic", padding: "16px" }}>
                    No alerts sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="btn">
          Back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default SOS;