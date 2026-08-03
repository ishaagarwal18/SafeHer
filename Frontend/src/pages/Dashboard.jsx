import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api, { dashboardApi } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [data, setData] = useState({
    journey_count: 0,
    contact_count: 0,
    sos_count: 0,
    contact: [],
  });

  useEffect(() => {
    dashboardApi
      .get("dashboard-data/")
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.post("logout/");
    } catch (_) {}
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="container">
      {/* Top Banner Greeting */}
      <div className="top-section">
        <div className="top-section-text">
          <h1>Welcome to SafeHer 🛡️</h1>
          <p>
            Stay protected, connected, and confident{user.name ? `, ${user.name}` : ""}. Your personal safety hub.
          </p>
        </div>
        <div className="top-actions">
          <Link to="/sos" className="btn btn-danger" style={{ padding: "10px 20px" }}>
            🚨 Emergency SOS
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-icon">🚖</div>
          <div className="stat-card-info">
            <h2>{data.journey_count}</h2>
            <p>Active Journeys</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📞</div>
          <div className="stat-card-info">
            <h2>{data.contact_count}</h2>
            <p>Trusted Contacts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-card-info">
            <h2>{data.sos_count}</h2>
            <p>SOS Alerts Sent</p>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid">
        <div className="feature-card sos-card">
          <div className="feature-card-header">
            <span className="feature-icon-wrapper">🚨</span>
            <h2>Emergency SOS</h2>
          </div>
          <p>Instant panic alert button to send your live GPS location & SMS to trusted contacts.</p>
          <Link to="/sos">Trigger SOS Alert →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-icon-wrapper">🚖</span>
            <h2>Start Journey</h2>
          </div>
          <p>Begin safe route monitoring, GPS tracking & Community Unsafe Area warning alerts.</p>
          <Link to="/journey">Start Tracking →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-icon-wrapper">📍</span>
            <h2>Nearby Safe Places</h2>
          </div>
          <p>Locate 15+ verified emergency centers including Police, Civil Hospitals, Pharmacies & Malls.</p>
          <Link to="/safe-places">Explore Places →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-icon-wrapper">📞</span>
            <h2>Trusted Contacts</h2>
          </div>
          <p>Manage family members and close friends who receive your emergency alerts.</p>
          <Link to="/contacts">Manage Contacts →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-icon-wrapper">⚠️</span>
            <h2>Report Unsafe Area</h2>
          </div>
          <p>Report poorly lit areas or harassment hotspots to help protect other women.</p>
          <Link to="/report">File Report →</Link>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-icon-wrapper">🧭</span>
            <h2>Trip History</h2>
          </div>
          <p>Review past travel logs, duration statistics, and route navigation records.</p>
          <Link to="/history">View History →</Link>
        </div>
      </div>

      {/* Trusted Contacts Quick Section */}
      <div className="quick-section">
        <div className="quick-section-header">
          <h2>🛡️ Your Trusted Guardians</h2>
          <Link to="/contacts" className="btn-sm">
            + Add Contact
          </Link>
        </div>

        <div className="contacts-grid">
          {data.contact && data.contact.length > 0 ? (
            data.contact.map((person, index) => (
              <div className="contact-box" key={index}>
                <div className="contact-avatar">{person.contact_name ? person.contact_name[0].toUpperCase() : "👤"}</div>
                <div className="contact-details">
                  <strong>{person.contact_name}</strong>
                  <p>
                    📞 {person.phone_number} • {person.relationship}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="contact-box" style={{ gridColumn: "1 / -1", justifyContent: "center", color: "#64748b" }}>
              No Trusted Contacts Added yet. Click "+ Add Contact" above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

