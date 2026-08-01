import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function Report() {
  const [form, setForm] = useState({ area: "", issue: "", description: "" });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = () => {
    dashboardApi.get("api/report/")
      .then((res) => setReports(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
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
        issue_type: form.issue,
        description: form.description
      });
      setSuccess("Report submitted successfully! Thank you for keeping the community safe.");
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

        <div className="card" style={{ maxWidth: "700px", margin: "0 auto 24px" }}>
          <p style={{ color: "var(--text-muted, #64748b)", marginBottom: "20px" }}>
            Alert other women and emergency responders about poorly lit streets, unsafe incidents, or suspicious activity.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                name="area"
                placeholder="Area Name / Location"
                value={form.area}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                name="issue"
                placeholder="Issue Type (e.g. Harassment, Poor Lighting)"
                value={form.issue}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe the issue..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
            {success && <p style={{ color: "green", marginBottom: "12px", fontWeight: "bold" }}>{success}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Submitting Report..." : "Submit Report"}
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
                    <td><strong>{r.area_name}</strong></td>
                    <td>
                      <span className="status-badge pending">{r.issue_type || "General"}</span>
                    </td>
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

      <div className="nav-links" style={{ textAlign: "center" }}>
        <Link to="/dashboard" className="btn">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default Report;