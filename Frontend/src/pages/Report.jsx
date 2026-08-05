import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiShield, FiFileText } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";
import "../styles/features.css";

function Report() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ area: "", issue: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    try {
      const res = await dashboardApi.get("api/report/");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setReports([]);
    } finally {
      setFetching(false);
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
        description: form.description,
      });
      setSuccess("Unsafe area report submitted successfully! Thank you for protecting others.");
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
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiAlertCircle />
            </span>
            <div>
              <p className="eyebrow">SAFEHER COMMUNITY WARNINGS</p>
              <h1>Report Unsafe Area</h1>
              <p>Help protect fellow women by flagging poorly lit, isolated, or unsafe locations.</p>
            </div>
          </header>

          {/* Form Card */}
          <div className="journey-form-card" style={{ marginBottom: "24px" }}>
            <div className="section-title">
              <div>
                <h2>File Unsafe Location Report</h2>
                <p>Provide details of the location and issue type.</p>
              </div>
              <span className="secure-label">
                <FiShield /> Community Shield
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #ffb3b3",
                  color: "#c0392b",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  margin: "16px 0",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#047857",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  margin: "16px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input
                  type="text"
                  name="area"
                  placeholder="Area / Location Name (e.g. Sector 18 Alleyway)"
                  value={form.area}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="issue"
                  placeholder="Issue Type (e.g. Harassment, Poor Lighting, Stalking)"
                  value={form.issue}
                  onChange={handleChange}
                  required
                />
              </div>

              <textarea
                name="description"
                placeholder="Describe the safety incident or reason this area is unsafe..."
                rows="4"
                value={form.description}
                onChange={handleChange}
                required
                style={{ marginTop: "14px" }}
              />

              <button type="submit" className="journey-start-button" style={{ marginTop: "12px" }} disabled={loading}>
                {loading ? "Submitting Report..." : "Submit Unsafe Area Report"}
              </button>
            </form>
          </div>

          {/* Past Reports Table Card */}
          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <div>
                <h2>Reported Unsafe Locations ({reports.length})</h2>
                <p>Community reports recorded to alert other travellers.</p>
              </div>
            </div>

            {fetching ? (
              <div style={{ padding: "30px 0" }}>
                <Loader message="Loading reports..." />
              </div>
            ) : (
              <div className="journey-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Area / Location</th>
                      <th>Issue Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((r, i) => (
                        <tr key={r.id || i}>
                          <td>
                            <strong>⚠️ {r.area_name || r.area || r.location}</strong>
                          </td>
                          <td>
                            <span className="journey-status alert">
                              {r.issue_type || r.issue || "General Safety"}
                            </span>
                          </td>
                          <td>{r.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">
                          <div className="empty-journeys">
                            <FiFileText />
                            <strong>No community reports filed yet</strong>
                            <span>Be the first to submit a report if you encounter an unsafe area.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: "28px" }}>
            <Link to="/dashboard" className="back-to-dashboard-btn">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Report;