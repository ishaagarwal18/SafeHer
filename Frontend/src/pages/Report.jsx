import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function Report() {
  const [form, setForm] = useState({ location: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await dashboardApi.post("api/report/", form);
      setSuccess("✅ Report submitted successfully! Thank you for keeping the community safe.");
      setForm({ location: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">⚠️ Report Unsafe Area</h1>

      <div className="card" style={{ maxWidth: "680px", margin: "0 auto 24px" }}>
        <h2>Community Safety Alert</h2>
        <p style={{ color: "var(--text-muted, #64748b)", marginBottom: "24px", lineHeight: "1.6" }}>
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
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>
              Location / Area Name
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Near Metro Station Gate 3, Sector 62"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>
              Incident Details / Safety Reason
            </label>
            <textarea
              name="description"
              rows="5"
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