import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiSearch, FiCalendar, FiRotateCcw, FiEye } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";
import "../styles/features.css";

function SOSHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchHistory = (p = page) => {
    setLoading(true);
    const params = {
      page: p,
      page_size: 6,
      q: query,
      start_date: startDate,
      end_date: endDate,
    };

    dashboardApi
      .get("api/sos/history/", { params })
      .then((res) => {
        setSessions(res.data.results || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalCount(res.data.total || 0);
      })
      .catch(() => {
        setSessions([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory(1);
    setPage(1);
  }, [query, startDate, endDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchHistory(newPage);
    }
  };

  const formatDuration = (secs) => {
    if (!secs || secs <= 0) return "00m 00s";
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s < 10 ? "0" : ""}${s}s`;
  };

  return (
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiClock />
            </span>
            <div>
              <p className="eyebrow">SAFEHER AUDIT LOG</p>
              <h1>SOS Emergency History</h1>
              <p>Review past emergency alerts, recorded GPS coordinates, audio/video clips, and photos.</p>
            </div>
          </header>

          {/* Filters Card */}
          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <div>
                <h2>Filter Emergency Logs</h2>
                <p>Filter by location keyword or date range.</p>
              </div>
            </div>

            <div className="history-filters">
              <label className="search-field">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search location or status..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                <FiCalendar />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                <FiCalendar />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="map-button"
                onClick={() => {
                  setQuery("");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <FiRotateCcw /> Reset Filters
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <div>
                <h2>Emergency Logs ({totalCount})</h2>
                <p>Recorded emergency sessions and media attachments.</p>
              </div>
              <Link to="/sos" className="banner-action-btn" style={{ textDecoration: "none" }}>
                🚨 Trigger SOS
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: "40px 0" }}>
                <Loader message="Loading emergency logs..." />
              </div>
            ) : sessions.length > 0 ? (
              <div className="journey-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Last Known Location</th>
                      <th>Media / Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{new Date(s.start_time).toLocaleDateString()}</strong>
                        </td>
                        <td>{new Date(s.start_time).toLocaleTimeString()}</td>
                        <td>{s.end_time ? new Date(s.end_time).toLocaleTimeString() : "Ongoing"}</td>
                        <td>{formatDuration(s.duration_seconds)}</td>
                        <td>
                          <span className={`journey-status ${s.status === "Active" ? "alert" : "completed"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ maxWidth: "220px", wordBreak: "break-word" }}>
                          {s.last_known_location || s.initial_location || "Location not recorded"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="map-button"
                            onClick={() => setSelectedSession(s)}
                          >
                            <FiEye /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-journeys">
                <FiSearch />
                <strong>No emergency logs found</strong>
                <span>No emergency sessions match your search or date criteria.</span>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  className="map-button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ← Previous
                </button>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="map-button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next →
                </button>
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

      {/* Details & Media Modal */}
      {selectedSession && (
        <div className="sos-modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="sos-modal-content" style={{ width: "650px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#ff4f81", marginBottom: "10px" }}>🚨 SOS Session #{selectedSession.id}</h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              Status: <strong>{selectedSession.status}</strong> • Duration: {formatDuration(selectedSession.duration_seconds)}
            </p>

            <div style={{ textAlign: "left", maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
              <div className="metric-box" style={{ marginBottom: "16px" }}>
                <label>Last Known Location</label>
                <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                  📍 {selectedSession.last_known_location || selectedSession.initial_location}
                </div>
              </div>

              {/* Photos */}
              <h4 style={{ color: "#ff4f81", marginTop: "16px", marginBottom: "8px" }}>
                📷 Photos ({selectedSession.photos?.length || 0})
              </h4>
              {selectedSession.photos && selectedSession.photos.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
                  {selectedSession.photos.map((p) => (
                    <a key={p.id} href={p.image_url} target="_blank" rel="noreferrer">
                      <img
                        src={p.image_url}
                        alt="SOS Capture"
                        style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>No photos captured for this session.</p>
              )}

              {/* Audios */}
              <h4 style={{ color: "#ff4f81", marginTop: "16px", marginBottom: "8px" }}>
                🎙️ Audio Recordings ({selectedSession.audios?.length || 0})
              </h4>
              {selectedSession.audios && selectedSession.audios.length > 0 ? (
                selectedSession.audios.map((a) => (
                  <div key={a.id} style={{ marginBottom: "10px" }}>
                    <audio controls src={a.audio_url} style={{ width: "100%" }} />
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>No audio recorded for this session.</p>
              )}

              {/* Videos */}
              <h4 style={{ color: "#ff4f81", marginTop: "16px", marginBottom: "8px" }}>
                📹 Video Clips ({selectedSession.videos?.length || 0})
              </h4>
              {selectedSession.videos && selectedSession.videos.length > 0 ? (
                selectedSession.videos.map((v) => (
                  <div key={v.id} style={{ marginBottom: "10px" }}>
                    <video controls src={v.video_url} style={{ width: "100%", borderRadius: "10px", maxHeight: "200px" }} />
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>No video recorded for this session.</p>
              )}
            </div>

            <button
              type="button"
              className="btn-cancel-sos"
              onClick={() => setSelectedSession(null)}
              style={{ marginTop: "24px", width: "100%" }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default SOSHistory;
