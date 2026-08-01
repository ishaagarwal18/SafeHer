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
      const res = await dashboardApi.get("api/reports/");
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
      await dashboardApi.post("api/reports/", form);
      setSuccess("Report submitted successfully! Thank you for keeping the community safe.");
      setForm({ area: "", issue: "", description: "" });
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="container">
        <h1 className="page-title">⚠️ Report Unsafe Area</h1>

        <div className="card">
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            Alert other women and emergency responders about poorly lit streets, unsafe incidents, or suspicious activity.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="area"
              placeholder="Area / Location Name (e.g. Sector 62)"
              value={form.area}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="issue"
              placeholder="Issue Type (e.g. Harassment, Poor Lighting)"
              value={form.issue}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              rows="4"
              placeholder="Describe what happened or why this area felt unsafe..."
              value={form.description}
              onChange={handleChange}
              required
            />

            {error && <p style={{ color: "red", margin: "8px 0" }}>{error}</p>}
            {success && <p style={{ color: "green", margin: "8px 0", fontWeight: "bold" }}>{success}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Submitting Report..." : "Submit Unsafe Area Report"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Recent Community Reports</h2>
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
                reports.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td><strong>{r.area_name || r.location}</strong></td>
                    <td>{r.issue_type || "Unsafe Area"}</td>
                    <td>{r.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                    No reports yet.
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

export default Report;