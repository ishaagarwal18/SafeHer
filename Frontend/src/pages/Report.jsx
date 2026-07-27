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
      setSuccess("Report submitted successfully! Thank you for keeping the community safe.");
      setForm({ location: "", description: "" });
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

        <div className="card" style={{ maxWidth: "650px", margin: "0 auto 24px" }}>
          <p style={{ color: "var(--text-muted, #64748b)", marginBottom: "20px" }}>
            Alert other women and emergency responders about poorly lit streets, unsafe incidents, or suspicious activity.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Location / Address</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Near Metro Station Gate 3, Sector 62"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Incident Description</label>
              <textarea
                name="description"
                rows="5"
                placeholder="Describe what happened or why this area felt unsafe..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
            {success && <p style={{ color: "green", marginBottom: "12px", fontWeight: "bold" }}>{success}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Submitting Report..." : "Submit Unsafe Area Report"}
            </button>
          </form>
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