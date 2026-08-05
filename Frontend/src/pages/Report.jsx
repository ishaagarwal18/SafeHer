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
        location: form.area,
        area: form.area,
        issue_type: form.issue,
        description: form.description
      });
      setSuccess("Report submitted successfully!");
      setForm({ area: "", issue: "", description: "" });
      fetchReports();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="page-title">⚠️ Report Unsafe Area</h1>

        <div className="card">
          {error && (
            <div style={{ color: "red", marginBottom: "12px", fontSize: "14px" }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: "#276749", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="area"
              placeholder="Area Name"
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
              placeholder="Describe the issue..."
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>

          <br />

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
                    <td>
                      <strong>{r.area_name || r.area || r.location}</strong>
                    </td>
                    <td>{r.issue_type || r.issue || "General"}</td>
                    <td>{r.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "16px", color: "#aaa" }}>
                    No reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="back-dashboard-btn">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default Report;