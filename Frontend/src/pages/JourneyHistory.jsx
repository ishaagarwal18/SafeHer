import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiCheckCircle, FiFilter, FiNavigation, FiSearch, FiShield } from "react-icons/fi";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";

const statusClass = (status = "Active") => status.toLowerCase().includes("complete") || status.toLowerCase().includes("safe") ? "completed" : status.toLowerCase().includes("cancel") || status.toLowerCase().includes("alert") ? "alert" : "active";

function JourneyHistory() {
  const [journeys, setJourneys] = useState([]); const [search, setSearch] = useState(""); const [status, setStatus] = useState("All"); const [transport, setTransport] = useState("All");
  useEffect(() => { dashboardApi.get("api/journey/").then((res) => setJourneys(Array.isArray(res.data) ? res.data : [])).catch(() => setJourneys([])); }, []);
  const filtered = useMemo(() => journeys.filter((journey) => {
    const matchesSearch = !search || `${journey.source} ${journey.destination}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "All" || (journey.status || "Active").toLowerCase() === status.toLowerCase()) && (transport === "All" || (journey.transport_mode || journey.transport) === transport);
  }), [journeys, search, status, transport]);
  const completed = journeys.filter((journey) => statusClass(journey.status) === "completed").length;
  const active = journeys.filter((journey) => statusClass(journey.status) === "active").length;
  return <main className="journey-page"><div className="journey-shell">
    <header className="journey-heading"><span className="journey-heading__icon"><FiCalendar /></span><div><p className="eyebrow">SAFEHER ACTIVITY</p><h1>Journey & trip history</h1><p>Review your previous routes and safety status.</p></div></header>
    <section className="history-summary"><article><span className="summary-icon pink"><FiNavigation /></span><div><strong>{journeys.length}</strong><span>Total journeys</span></div></article><article><span className="summary-icon green"><FiCheckCircle /></span><div><strong>{completed}</strong><span>Completed safely</span></div></article><article><span className="summary-icon blue"><FiShield /></span><div><strong>{active}</strong><span>Active journeys</span></div></article></section>
    <section className="history-card"><div className="section-title"><div><h2>All past journeys</h2><p>Search and filter your trip records.</p></div></div><div className="history-filters"><label className="search-field"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search source or destination" /></label><label><FiFilter /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Active</option><option>Completed</option><option>Safe</option><option>Cancelled</option></select></label><label><FiNavigation /><select value={transport} onChange={(event) => setTransport(event.target.value)}><option>All</option><option>Car</option><option>Bus</option><option>Train</option><option>Walking</option></select></label></div><div className="journey-table-wrap"><table><thead><tr><th>#</th><th>Route</th><th>Transport</th><th>Status</th><th>Started at</th></tr></thead><tbody>{filtered.length ? filtered.map((journey, index) => <tr key={journey.id || index}><td>{index + 1}</td><td><strong>{journey.source}</strong><span>{journey.destination}</span></td><td>{journey.transport_mode || journey.transport || "Car"}</td><td><span className={`journey-status ${statusClass(journey.status)}`}>{journey.status || "Active"}</span></td><td>{journey.start_time ? new Date(journey.start_time).toLocaleString() : "—"}</td></tr>) : <tr><td colSpan="5"><div className="empty-journeys"><FiSearch /><strong>No matching journeys</strong><span>Try another filter, or start a new journey.</span></div></td></tr>}</tbody></table></div></section>
    <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
  </div></main>;
}

export default JourneyHistory;
