import { useState, useEffect } from "react";
<<<<<<< HEAD
import { Link } from "react-router-dom";
import { FiGrid, FiNavigation, FiPhone, FiAlertTriangle, FiMapPin, FiAlertCircle, FiClock, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";
import "../styles/dashboard.css";

function Dashboard() {
  const { user } = useAuth();
=======
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api, { dashboardApi } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d

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

<<<<<<< HEAD
  const userName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiGrid />
            </span>
            <div>
              <p className="eyebrow">SAFEHER SAFETY HUB</p>
              <h1>Welcome back, {userName} 💖</h1>
              <p>Your personal safety console. Stay protected and connected wherever you go.</p>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="history-summary" style={{ marginBottom: "28px" }}>
            <article>
              <span className="summary-icon pink">
                <FiNavigation />
              </span>
              <div>
                <strong>{data.journey_count}</strong>
                <span>Total Journeys</span>
              </div>
            </article>

            <article>
              <span className="summary-icon green">
                <FiPhone />
              </span>
              <div>
                <strong>{data.contact_count}</strong>
                <span>Trusted Contacts</span>
              </div>
            </article>

            <article>
              <span className="summary-icon blue">
                <FiShield />
              </span>
              <div>
                <strong>{data.sos_count}</strong>
                <span>SOS Alerts</span>
              </div>
            </article>
          </section>

          {/* Quick Actions Grid */}
          <div className="history-card" style={{ marginBottom: "28px" }}>
            <div className="section-title" style={{ marginBottom: "20px" }}>
              <div>
                <h2>Safety Features & Services</h2>
                <p>Quick access to all emergency tools and trip planning features.</p>
              </div>
            </div>

            <div className="grid">
              <div className="feature-card sos-card">
                <h2>🚨 SOS Emergency</h2>
                <p>Instant 5s countdown emergency alert</p>
                <Link to="/sos">Open Console →</Link>
              </div>

              <div className="feature-card">
                <h2>📞 Emergency Contacts</h2>
                <p>Manage family & trusted helpers</p>
                <Link to="/contacts">Open Contacts →</Link>
              </div>

              <div className="feature-card">
                <h2>🚖 Start Journey</h2>
                <p>Track travel & 10m safety check-in</p>
                <Link to="/journey">Start Travel →</Link>
              </div>

              <div className="feature-card">
                <h2>📍 Nearby Safe Places</h2>
                <p>Hospitals, police stations & clinics</p>
                <Link to="/safe-places">Find Nearby →</Link>
              </div>

              <div className="feature-card">
                <h2>⚠️ Report Unsafe Area</h2>
                <p>Flag unlit or unsafe streets</p>
                <Link to="/report">File Report →</Link>
              </div>

              <div className="feature-card">
                <h2>🧭 Trip History</h2>
                <p>Review past travel logs & routes</p>
                <Link to="/history">View Logs →</Link>
              </div>
            </div>
          </div>

          {/* Trusted Contacts Quick Section */}
          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title" style={{ marginBottom: "16px" }}>
              <div>
                <h2>⭐ Active Trusted Contacts</h2>
                <p>Contacts configured for auto-notification in case of emergency.</p>
              </div>
              <Link to="/contacts" className="banner-action-btn" style={{ textDecoration: "none" }}>
                + Manage Contacts
              </Link>
            </div>

            {data.contact && data.contact.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "14px" }}>
                {data.contact.map((person, index) => (
                  <div
                    key={index}
                    style={{
                      background: "linear-gradient(135deg, #ffffff, #fff0f5)",
                      border: "1px solid #ffe4ec",
                      borderRadius: "16px",
                      padding: "16px",
                    }}
                  >
                    <strong style={{ fontSize: "16px", color: "#1e293b", display: "block" }}>
                      {person.contact_name}
                    </strong>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                      📞 {person.phone_number} • {person.relationship || "Trusted Contact"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-journeys">
                <FiPhone />
                <strong>No trusted contacts added yet</strong>
                <span>
                  <Link to="/contacts" style={{ color: "#ff4f81", fontWeight: 700 }}>
                    Add trusted contacts now →
                  </Link>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
=======
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
      <div className="top-section">
        <div>
          <h1>Welcome to SafeHer 💖</h1>
          <p>Stay protected and connected.</p>
        </div>
        <a href="/" className="logout-btn" onClick={handleLogout}>
          Logout
        </a>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h2>{data.journey_count}</h2>
          <p>Journeys</p>
        </div>
        <div className="stat-card">
          <h2>{data.contact_count}</h2>
          <p>Contacts</p>
        </div>
        <div className="stat-card">
          <h2>{data.sos_count}</h2>
          <p>SOS Alerts</p>
        </div>
      </div>

      <div className="grid">
        <div className="feature-card sos-card">
          <h2>🚨 SOS</h2>
          <p>Trigger emergency alert</p>
          <Link to="/sos">Open</Link>
        </div>

        <div className="feature-card">
          <h2>📞 Emergency Contacts</h2>
          <p>Manage trusted people</p>
          <Link to="/contacts">Open</Link>
        </div>

        <div className="feature-card">
          <h2>🚖 Start Journey</h2>
          <p>Begin safe travel tracking</p>
          <Link to="/journey">Open</Link>
        </div>

        <div className="feature-card">
          <h2>📍 Nearby Safe Places</h2>
          <p>Hospitals & police stations</p>
          <Link to="/safe-places">Open</Link>
        </div>

        <div className="feature-card">
          <h2>⚠️ Report Unsafe Area</h2>
          <p>Help others stay safe</p>
          <Link to="/report">Open</Link>
        </div>

        <div className="feature-card">
          <h2>🧭 Journey History</h2>
          <p>View previous trips</p>
          <Link to="/history">Open</Link>
        </div>
      </div>

      <div className="quick-section">
        <h2>Trusted Contacts</h2>

        {data.contact && data.contact.length > 0 ? (
          data.contact.map((person, index) => (
            <div className="contact-box" key={index}>
              <strong>{person.contact_name}</strong> • {person.phone_number} • {person.relationship}
            </div>
          ))
        ) : (
          <div className="contact-box">No Trusted Contacts Added</div>
        )}
      </div>
    </div>
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
  );
}

export default Dashboard;
