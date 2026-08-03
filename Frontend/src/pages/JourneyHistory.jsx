import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function JourneyHistory() {
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    dashboardApi
      .get("api/journey/")
      .then((res) => setJourneys(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJourneys([]));
  }, []);

  return (
    <>
      <div className="container">
        <h1 className="page-title">🧭 Journey History</h1>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Destination</th>
                <th>Transport</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {journeys.length > 0 ? (
                journeys.map((j, i) => (
                  <tr key={j.id || i}>
                    <td>
                      <strong>{j.source}</strong>
                    </td>
                    <td>
                      <strong>{j.destination}</strong>
                    </td>
                    <td>{j.transport_mode || j.transport || "Car"}</td>
                    <td>
                      <span className="status-pill">{j.status || "Safe"}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "16px", color: "#aaa" }}>
                    No Journey History Found
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

export default JourneyHistory;