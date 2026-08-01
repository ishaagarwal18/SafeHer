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
        dashboardApi.get("dashboard-data/")
            .then((res) => setData(res.data))
            .catch(() => {
                // If error, fail silently
            });
    }, []);

    const handleLogout = async (e) => {
        if (e) e.preventDefault();
        try {
            await api.post("logout/");
        } catch (_) {
            // ignore
        }
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="container">
            <div className="top-section">
                <h1>Welcome to SafeHer 💖</h1>
                <p>Stay protected and connected{user.name ? `, ${user.name}` : ""}.</p>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
                <div className="feature-card sos-card" onClick={() => navigate("/sos")}>
                    <h2>🚨 SOS</h2>
                    <p>Trigger emergency alert</p>
                    <Link to="/sos" onClick={(e) => e.stopPropagation()}>Open</Link>
                </div>
                <div className="feature-card" onClick={() => navigate("/contacts")}>
                    <h2>📞 Emergency Contacts</h2>
                    <p>Manage trusted people</p>
                    <Link to="/contacts" onClick={(e) => e.stopPropagation()}>Open</Link>
                </div>
                <div className="feature-card" onClick={() => navigate("/journey")}>
                    <h2>🚖 Start Journey</h2>
                    <p>Begin safe travel tracking</p>
                    <Link to="/journey" onClick={(e) => e.stopPropagation()}>Open</Link>
                </div>
                <div className="feature-card" onClick={() => navigate("/safe-places")}>
                    <h2>📍 Nearby Safe Places</h2>
                    <p>Hospitals & police stations</p>
                    <Link to="/safe-places" onClick={(e) => e.stopPropagation()}>Open</Link>
                </div>
                <div className="feature-card" onClick={() => navigate("/report")}>
                    <h2>⚠️ Report Unsafe Area</h2>
                    <p>Help others stay safe</p>
                    <Link to="/report" onClick={(e) => e.stopPropagation()}>Open</Link>
                </div>
                <div className="feature-card" onClick={() => navigate("/history")}>
                    <h2>🧭 Journey History</h2>
                    <p>View previous trips</p>
                    <Link to="/history" onClick={(e) => e.stopPropagation()}>Open</Link>
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
