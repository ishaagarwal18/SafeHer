import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

const TRANSPORT_ICONS = {
  car: "🚗",
  "cab / auto": "🚖",
  bus: "🚌",
  train: "🚆",
  "bike / scooter": "🛵",
  walking: "🚶‍♀️"
};

function JourneyHistory() {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get("api/journey/")
      .then((res) => {
        setJourneys(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setJourneys([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openGoogleMaps = (source, destination, transport) => {
    let mode = "driving";
    const t = (transport || "").toLowerCase();
    if (t.includes("bus") || t.includes("train")) mode = "transit";
    if (t.includes("walk")) mode = "walking";
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
    window.open(url, "_blank");
  };

  const getIcon = (mode) => {
    const key = (mode || "").toLowerCase();
    return TRANSPORT_ICONS[key] || "🚖";
  };

  return (
    <div className="container">
      <h1 className="page-title">🧭 Complete Trip & Journey History</h1>

      <div className="card">
        <h2>Your Travel Records</h2>

        {loading ? (
          <p style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Loading journey history...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Transport</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Started Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {journeys.length > 0 ? (
                journeys.map((journey, index) => (
                  <tr key={journey.id || index}>
                    <td>
                      <span style={{ fontSize: "18px", marginRight: "8px" }}>{getIcon(journey.transport_mode)}</span>
                      <strong>{journey.transport_mode || "Car"}</strong>
                    </td>
                    <td>{journey.source}</td>
                    <td>{journey.destination}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          journey.status === "Completed" ? "completed" : journey.status === "Started" ? "started" : "pending"
                        }`}
                      >
                        {journey.status || "Completed"}
                      </span>
                    </td>
                    <td>{journey.start_time ? new Date(journey.start_time).toLocaleString() : "Recently"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-sm"
                        onClick={() => openGoogleMaps(journey.source, journey.destination, journey.transport_mode)}
                      >
                        🗺 View Route
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No Journey History Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default JourneyHistory;