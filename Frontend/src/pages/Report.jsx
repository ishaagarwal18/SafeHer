import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { FiAlertCircle, FiShield, FiFileText } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";
import "../styles/features.css";
=======
import "../styles/features.css";
import { dashboardApi } from "../services/api";
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d

function Report() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ area: "", issue: "", description: "" });
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [fetching, setFetching] = useState(true);
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReports = async () => {
    try {
      const res = await dashboardApi.get("api/report/");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setReports([]);
<<<<<<< HEAD
    } finally {
      setFetching(false);
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
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
<<<<<<< HEAD
        description: form.description,
      });
      setSuccess("Unsafe area report submitted successfully! Thank you for protecting others.");
=======
        description: form.description
      });
      setSuccess("Report submitted successfully!");
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
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
<<<<<<< HEAD
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
=======
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
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
  );
}

export default Report;