import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function Report() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ area: "", issue: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    try {
      const res = await dashboardApi.get("api/report/");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await dashboardApi.post("api/report/", {
        location: form.location || form.area,
        area: form.area || form.location,
        issue_type: form.issue || "Unsafe Area",
        description: form.description
      });
      setSuccess("✅ Report submitted successfully! Thank you for keeping the community safe.");
      setForm({ location: "", area: "", issue: "", description: "" });
      fetchReports();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">⚠️ Report Unsafe Area</h1>

      <div className="card" style={{ maxWidth: "700px", margin: "0 auto 24px" }}>
        <h2>Community Safety Alert</h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          Alert other women and emergency responders about poorly lit streets, lack of police patrolling, unsafe incidents, or harassment hotspots.
        </p>

        {error && (
          <div className="alert-box alert-danger">
            <p style={{ fontWeight: "700", margin: 0 }}>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <p style={{ fontWeight: "700", margin: 0 }}>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>
              Location / Area Name
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Near Metro Station Gate 3, Sector 62"
              value={form.location || form.area}
              onChange={(e) => setForm({ ...form, location: e.target.value, area: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>
              Incident Details / Safety Reason
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Describe why this area felt unsafe (e.g. dark streetlights, harassment, isolated road)..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "15px" }}>
            {loading ? "Submitting Report..." : "🚨 Submit Unsafe Area Report"}
          </button>
        </form>

        <h2 style={{ marginTop: "32px", marginBottom: "16px" }}>Reported Unsafe Areas</h2>
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Issue</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((r, i) => (
                <tr key={r.id || i}>
                  <td><strong>{r.area_name || r.area || r.location}</strong></td>
                  <td>
                    <span className="status-badge pending">{r.issue_type || r.issue || "Unsafe Area"}</span>
                  </td>
                  <td>{r.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                  No reports submitted yet.
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

export default Report;