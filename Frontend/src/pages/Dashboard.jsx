import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import api, { dashboardApi } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

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
  );
}

export default Dashboard;
