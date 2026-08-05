<<<<<<< HEAD
import JourneyHistory from "./JourneyHistory";

function History() {
  return <JourneyHistory />;
=======
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";
import Loader from "../components/Loader";

function History() {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filteredJourneys = journeys.filter((j) => {
    if (filter === "all") return true;
    return (j.status || "").toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="container">
      <h1 className="page-title">🧭 Journey & Trip History</h1>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>All Past Journeys</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color, #e2e8f0)",
              background: "var(--card-bg, #ffffff)"
            }}
          >
            <option value="all">All Statuses</option>
            <option value="started">Started / Active</option>
            <option value="completed">Completed</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {loading ? (
          <Loader message="Loading trip history..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Transport</th>
                <th>Status</th>
                <th>Started At</th>
              </tr>
            </thead>
            <tbody>
              {filteredJourneys.length > 0 ? (
                filteredJourneys.map((j, idx) => (
                  <tr key={j.id || idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{j.source}</strong></td>
                    <td><strong>{j.destination}</strong></td>
                    <td>{j.transport_mode || j.transport || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${j.status?.toLowerCase()}`}>
                        {j.status || "Completed"}
                      </span>
                    </td>
                    <td>
                      {j.start_time
                        ? new Date(j.start_time).toLocaleString()
                        : j.created_at
                        ? new Date(j.created_at).toLocaleString()
                        : "Recent"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px" }}>
                    No journey records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="back-dashboard-btn">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
}

export default History;
