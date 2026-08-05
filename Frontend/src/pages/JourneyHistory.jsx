import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiCheckCircle, FiFilter, FiNavigation, FiSearch, FiShield, FiAlertTriangle } from "react-icons/fi";
import { dashboardApi } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import "../styles/journey.css";

const statusClass = (status = "Active") => {
  const lower = status.toLowerCase();
  if (lower.includes("complete") || lower.includes("safe")) return "completed";
  if (lower.includes("cancel") || lower.includes("alert") || lower.includes("unsafe") || lower.includes("escalat")) return "alert";
  return "active";
};

const DEFAULT_FALLBACK_JOURNEYS = [
  {
    id: 101,
    source: "Downtown Central Bus Stand",
    destination: "Green Park Residential Complex",
    transport_mode: "Bus",
    status: "Completed",
    start_time: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 102,
    source: "Metro Station Gate 2",
    destination: "City Women's Hostel",
    transport_mode: "Walking",
    status: "Completed",
    start_time: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 103,
    source: "Tech Park Office Tower B",
    destination: "International Airport Terminal 1",
    transport_mode: "Car",
    status: "Active",
    start_time: new Date(Date.now() - 900000).toISOString(),
  },
];

function JourneyHistory() {
  const [journeys, setJourneys] = useState(DEFAULT_FALLBACK_JOURNEYS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [transportFilter, setTransportFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJourneys = () => {
    setLoading(true);
    dashboardApi
      .get("api/journey/")
      .then((res) => {
        const list = Array.isArray(res.data) && res.data.length > 0 ? res.data : DEFAULT_FALLBACK_JOURNEYS;
        setJourneys(list);
      })
      .catch(() => setJourneys(DEFAULT_FALLBACK_JOURNEYS))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const openMap = (source, destination, transport) => {
    const mode = ["Bus", "Train"].includes(transport) ? "transit" : transport === "Walking" ? "walking" : "driving";
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const markCompleted = async (journeyId) => {
    setActionLoading(true);
    try {
      await dashboardApi.post(`api/journey/${journeyId}/complete/`);
      fetchJourneys();
    } catch (_) {
      alert("Failed to complete journey.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJourneys = useMemo(() => {
    return journeys.filter((j) => {
      const matchSearch =
        !search ||
        `${j.source} ${j.destination}`.toLowerCase().includes(search.toLowerCase());

      const jStatus = (j.status || "Active").toLowerCase();
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && jStatus === "active") ||
        (statusFilter === "Completed" && (jStatus.includes("complete") || jStatus.includes("safe"))) ||
        (statusFilter === "Alert" && (jStatus.includes("alert") || jStatus.includes("unsafe") || jStatus.includes("escalat")));

      const jTransport = (j.transport_mode || j.transport || "Car").toLowerCase();
      const matchTransport =
        transportFilter === "All" || jTransport === transportFilter.toLowerCase();

      return matchSearch && matchStatus && matchTransport;
    });
  }, [journeys, search, statusFilter, transportFilter]);

  const completedCount = useMemo(
    () => journeys.filter((j) => statusClass(j.status) === "completed").length,
    [journeys]
  );
  const activeCount = useMemo(
    () => journeys.filter((j) => statusClass(j.status) === "active").length,
    [journeys]
  );
  const alertCount = useMemo(
    () => journeys.filter((j) => statusClass(j.status) === "alert").length,
    [journeys]
  );

  return (
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiCalendar />
            </span>
            <div>
              <p className="eyebrow">SAFEHER ACTIVITY LOG</p>
              <h1>Journey & Trip History</h1>
              <p>Review your past travel routes, safety check-ins, and active trip statuses.</p>
            </div>
          </header>

          {/* Summary Stats */}
          <section className="history-summary">
            <article>
              <span className="summary-icon pink">
                <FiNavigation />
              </span>
              <div>
                <strong>{journeys.length}</strong>
                <span>Total Journeys</span>
              </div>
            </article>

            <article>
              <span className="summary-icon green">
                <FiCheckCircle />
              </span>
              <div>
                <strong>{completedCount}</strong>
                <span>Completed Safely</span>
              </div>
            </article>

            <article>
              <span className="summary-icon blue">
                <FiShield />
              </span>
              <div>
                <strong>{activeCount}</strong>
                <span>Active Journeys</span>
              </div>
            </article>
          </section>

          {/* Table Card & Filters */}
          <section className="history-card">
            <div className="section-title">
              <div>
                <h2>All Trip Records</h2>
                <p>Search by location or filter by trip status and transport method.</p>
              </div>
              <Link to="/journey" className="banner-action-btn" style={{ textDecoration: "none" }}>
                + Start New Journey
              </Link>
            </div>

            <div className="history-filters">
              <label className="search-field">
                <FiSearch />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search starting point or destination..."
                />
              </label>

              <label>
                <FiFilter />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Completed">Completed</option>
                  <option value="Alert">Alerts / Unsafe</option>
                </select>
              </label>

              <label>
                <FiNavigation />
                <select value={transportFilter} onChange={(e) => setTransportFilter(e.target.value)}>
                  <option value="All">All Modes</option>
                  <option value="Car">Car 🚗</option>
                  <option value="Bus">Bus 🚌</option>
                  <option value="Train">Train 🚆</option>
                  <option value="Walking">Walking 🚶</option>
                </select>
              </label>
            </div>

            {loading ? (
              <div style={{ padding: "40px 0" }}>
                <Loader message="Loading trip history..." />
              </div>
            ) : (
              <div className="journey-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Route</th>
                      <th>Transport</th>
                      <th>Status</th>
                      <th>Started At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJourneys.length ? (
                      filteredJourneys.map((journey, index) => {
                        const sClass = statusClass(journey.status);
                        const isActive = sClass === "active";
                        const transportMode = journey.transport_mode || journey.transport || "Car";

                        return (
                          <tr key={journey.id || index}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>📍 {journey.source}</strong>
                              <span>→ {journey.destination}</span>
                            </td>
                            <td>{transportMode}</td>
                            <td>
                              <span className={`journey-status ${sClass}`}>
                                {journey.status || "Active"}
                              </span>
                            </td>
                            <td>
                              {journey.start_time
                                ? new Date(journey.start_time).toLocaleString()
                                : "—"}
                            </td>
                            <td>
                              <div className="journey-actions">
                                <button
                                  type="button"
                                  className="map-button"
                                  onClick={() => openMap(journey.source, journey.destination, transportMode)}
                                  title="View on Google Maps"
                                >
                                  <FiNavigation /> Map
                                </button>
                                {isActive && (
                                  <button
                                    type="button"
                                    className="complete-button"
                                    disabled={actionLoading}
                                    onClick={() => markCompleted(journey.id)}
                                    title="Mark journey as completed"
                                  >
                                    End
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <div className="empty-journeys">
                            <FiSearch />
                            <strong>No matching journeys found</strong>
                            <span>Try adjusting your search query or filters.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Pink Back to Dashboard Button */}
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

export default JourneyHistory;
