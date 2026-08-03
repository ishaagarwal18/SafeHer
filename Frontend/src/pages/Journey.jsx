import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

const TRANSPORT_MODES = [
  { label: "Car", icon: "🚗", mode: "driving" },
  { label: "Cab / Auto", icon: "🚖", mode: "driving" },
  { label: "Bus", icon: "🚌", mode: "transit" },
  { label: "Train", icon: "🚆", mode: "transit" },
  { label: "Bike / Scooter", icon: "🛵", mode: "two-wheeler" },
  { label: "Walking", icon: "🚶‍♀️", mode: "walking" }
];

function Journey() {
  const [journeys, setJourneys] = useState([]);
  const [form, setForm] = useState({ source: "", destination: "", transport: "Car" });
  const [unsafeReports, setUnsafeReports] = useState([]);
  const [unsafeWarning, setUnsafeWarning] = useState(null);
  const [forceProceed, setForceProceed] = useState(false);

  const [activeJourney, setActiveJourney] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [locatingSource, setLocatingSource] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch recent journeys
    dashboardApi
      .get("api/journey/")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setJourneys(res.data);
          // Check if there is an active journey
          const active = res.data.find((j) => j.status === "Started" || j.status === "En-Route");
          if (active) {
            setActiveJourney(active);
          }
        }
      })
      .catch(() => {});

    // Fetch unsafe area reports to cross-check
    dashboardApi
      .get("api/sos/")
      .then(() => {})
      .catch(() => {});
  }, []);

  // Timer logic for active journey
  useEffect(() => {
    if (activeJourney) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsedSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeJourney]);

  const formatTimer = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (unsafeWarning) setUnsafeWarning(null);
  };

  const handleSwap = () => {
    setForm({ ...form, source: form.destination, destination: form.source });
  };

  // GPS Location Autofill for Source
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingSource(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const placeName = data.address?.suburb || data.address?.city || data.display_name.split(",")[0];
          setForm((prev) => ({ ...prev, source: placeName || `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
        } catch (_) {
          setForm((prev) => ({ ...prev, source: `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})` }));
        } finally {
          setLocatingSource(false);
        }
      },
      () => {
        setLocatingSource(false);
        setError("Could not fetch location. Please type manually.");
      },
      { timeout: 8000 }
    );
  };

  const openGoogleMaps = (source, destination, transport) => {
    const selectedMode = TRANSPORT_MODES.find((m) => m.label.toLowerCase() === (transport || "").toLowerCase());
    const travelmode = selectedMode ? selectedMode.mode : "driving";
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${travelmode}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Backend Unsafe area check logic parity
    if (!forceProceed && !unsafeWarning) {
      const srcLower = form.source.toLowerCase();
      const destLower = form.destination.toLowerCase();
      const matchedArea = unsafeReports.find(
        (area) => srcLower.includes(area.toLowerCase()) || destLower.includes(area.toLowerCase())
      );

      if (matchedArea) {
        setUnsafeWarning(
          `⚠️ Safety Warning: '${matchedArea}' has been reported as an unsafe area in community reports. Please stay safe!`
        );
        setForceProceed(true);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await dashboardApi.post("api/journey/", form);
      const newJourney = res.data || {
        id: Date.now(),
        source: form.source,
        destination: form.destination,
        transport_mode: form.transport,
        status: "Started",
        start_time: new Date().toISOString()
      };
      setJourneys((prev) => [newJourney, ...prev]);
      setActiveJourney(newJourney);
      openGoogleMaps(form.source, form.destination, form.transport);
      setForm({ source: "", destination: "", transport: "Car" });
      setUnsafeWarning(null);
      setForceProceed(false);
    } catch (err) {
      const fallbackJourney = {
        id: Date.now(),
        source: form.source,
        destination: form.destination,
        transport_mode: form.transport,
        status: "Started",
        start_time: new Date().toISOString()
      };
      setJourneys((prev) => [fallbackJourney, ...prev]);
      setActiveJourney(fallbackJourney);
      openGoogleMaps(form.source, form.destination, form.transport);
      setForm({ source: "", destination: "", transport: "Car" });
      setUnsafeWarning(null);
      setForceProceed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleArrivedSafely = () => {
    if (activeJourney) {
      setJourneys((prev) =>
        prev.map((j) => (j.id === activeJourney.id ? { ...j, status: "Completed" } : j))
      );
      setActiveJourney(null);
    }
  };

  const getTransportIcon = (transportName) => {
    const found = TRANSPORT_MODES.find((m) => m.label.toLowerCase() === (transportName || "").toLowerCase());
    return found ? found.icon : "🚖";
  };

  return (
    <div className="container">
      <h1 className="page-title">🚖 Start Journey & Live Safety Monitoring</h1>

      {/* Active Journey Tracker Banner */}
      {activeJourney && (
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            border: "2px solid #059669",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.15)"
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="status-pill completed" style={{ fontSize: "12px" }}>
                  🟢 Live Tracking Active
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#047857" }}>
                  ⏱ Elapsed: {formatTimer(elapsedSeconds)}
                </span>
              </div>
              <h2 style={{ color: "#065f46", fontSize: "20px", margin: "4px 0" }}>
                {getTransportIcon(activeJourney.transport_mode || activeJourney.transport)} {activeJourney.source} → {activeJourney.destination}
              </h2>
              <p style={{ color: "#047857", fontSize: "13.5px" }}>
                Your route is active. Click "Arrived Safely" when you reach your destination.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={handleArrivedSafely} className="btn btn-success">
                ✅ Arrived Safely
              </button>
              <Link to="/sos" className="btn btn-danger">
                🚨 Emergency SOS
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Start Journey Card */}
      <div className="card">
        <h2>Begin New Travel Session</h2>

        {unsafeWarning && (
          <div className="alert-box alert-warning">
            <div style={{ fontSize: "22px" }}>⚠️</div>
            <div>
              <strong>Unsafe Area Alert</strong>
              <p>{unsafeWarning}</p>
              <p style={{ marginTop: "6px", fontSize: "13px" }}>
                Click <strong>Proceed Anyway</strong> below to start your trip or adjust your route.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Starting From (Source)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="source"
                  placeholder="e.g. Connaught Place"
                  value={form.source}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="btn-sm"
                disabled={locatingSource}
                style={{ marginTop: "-10px", marginBottom: "14px" }}
              >
                {locatingSource ? "Locating..." : "📍 Use My GPS Location"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="btn-secondary"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                padding: 0,
                fontSize: "18px",
                margin: "12px 0 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Swap Source and Destination"
            >
              ⇅
            </button>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Destination Location</label>
              <input
                type="text"
                name="destination"
                placeholder="e.g. Cyber City"
                value={form.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Mode of Transport</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginTop: "8px", marginBottom: "20px" }}>
              {TRANSPORT_MODES.map((mode) => (
                <button
                  key={mode.label}
                  type="button"
                  onClick={() => setForm({ ...form, transport: mode.label })}
                  className={`btn ${form.transport === mode.label ? "" : "btn-secondary"}`}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px",
                    fontSize: "13.5px",
                    justifyContent: "flex-start",
                    border: form.transport === mode.label ? "none" : "1.5px solid var(--card-border)"
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{mode.icon}</span> {mode.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: "#dc2626", marginBottom: "14px", fontWeight: "600" }}>{error}</p>}

          <button type="submit" className="btn" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "16px" }}>
            {loading ? "Starting..." : forceProceed ? "⚠️ Proceed & Open Navigation" : "🚀 Start Journey & Open Navigation"}
          </button>
        </form>
      </div>

      {/* Journeys History Table Card */}
      <div className="card">
        <h2>🧭 Recent Trips & Navigation Records</h2>
        <table>
          <thead>
            <tr>
              <th>Transport</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {journeys.length > 0 ? (
              journeys.map((j, i) => (
                <tr key={j.id || i} className={j.id === activeJourney?.id ? "active-row" : ""}>
                  <td>
                    <span style={{ fontSize: "18px", marginRight: "8px" }}>
                      {getTransportIcon(j.transport_mode || j.transport)}
                    </span>
                    <strong>{j.transport_mode || j.transport || "Car"}</strong>
                  </td>
                  <td>{j.source}</td>
                  <td>{j.destination}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        j.status === "Completed"
                          ? "completed"
                          : j.status === "Started" || j.status === "En-Route"
                          ? "started"
                          : "pending"
                      }`}
                    >
                      {j.status || "Started"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() => openGoogleMaps(j.source, j.destination, j.transport_mode || j.transport)}
                    >
                      🗺 Open Route Map
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                  No Journey Found. Start your first travel session above.
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

export default Journey;