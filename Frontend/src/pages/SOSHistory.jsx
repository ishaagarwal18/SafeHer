import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

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
    <>
      <div className="container">
        <h1 className="page-title">📜 SOS Emergency History</h1>

        {/* Filters Card */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>SEARCH</label>
              <input
                type="text"
                placeholder="Search location or status..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ marginBottom: "0" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>FROM DATE</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ marginBottom: "0" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>TO DATE</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ marginBottom: "0" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setQuery("");
                  setStartDate("");
                  setEndDate("");
                }}
                style={{ padding: "12px 18px", width: "100%", borderRadius: "12px", cursor: "pointer" }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: "0" }}>Emergency Logs ({totalCount})</h2>
            <Link to="/sos" className="btn-sm" style={{ padding: "8px 16px" }}>
              🚨 Trigger SOS
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#ff4f81", fontWeight: "600" }}>
              Loading SOS history...
            </div>
          ) : sessions.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
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
                        <span className={`status-pill ${s.status === "Active" ? "pending" : "completed"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: "220px", wordBreak: "break-word" }}>
                        {s.last_known_location || s.initial_location || "Location not recorded"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => setSelectedSession(s)}
                          style={{ fontSize: "12px" }}
                        >
                          View Details 🔍
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#aaa", fontStyle: "italic", padding: "30px 0" }}>
              No emergency history matches your search.
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
                className="btn-sm"
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
                className="btn-sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
          <Link to="/dashboard" className="btn">
            ← Back to Dashboard
          </Link>
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
    </>
  );
}

export default SOSHistory;
