import { Link } from "react-router-dom";
import { FiMapPin, FiNavigation } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/journey.css";
import "../styles/features.css";

const SAFE_PLACES = [
  { name: "Civil Hospital", icon: "🏥", query: "Civil Hospital near me" },
  { name: "Police Station", icon: "👮", query: "Police Station near me" },
  { name: "Pharmacy", icon: "💊", query: "Pharmacy near me" },
  { name: "Emergency Hospital", icon: "🚑", query: "Emergency Hospital near me" },
  { name: "Women's Police Station", icon: "👩‍✈️", query: "Women Police Station near me" },
  { name: "Fire Station", icon: "🚒", query: "Fire Station near me" },
  { name: "Women Help Center", icon: "🛡️", query: "Women Help Center near me" },
  { name: "24×7 Clinic", icon: "🏥", query: "24 Hours Clinic near me" },
  { name: "Taxi Stand", icon: "🚖", query: "Taxi Stand near me" },
  { name: "Bus Stop", icon: "🚌", query: "Bus Stop near me" },
  { name: "Railway Station", icon: "🚉", query: "Railway Station near me" },
  { name: "Petrol Pump", icon: "⛽", query: "Petrol Pump near me" },
  { name: "ATM / Bank", icon: "🏦", query: "ATM near me" },
  { name: "Shopping Mall", icon: "🏬", query: "Shopping Mall near me" },
  { name: "24×7 Café", icon: "☕", query: "24 Hours Cafe near me" },
];

function SafePlaces() {
  return (
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiMapPin />
            </span>
            <div>
              <p className="eyebrow">SAFEHER LOCATION DIRECTORY</p>
              <h1>Nearby Safe Places & Help Centers</h1>
              <p>One-tap live navigation to nearest hospitals, police stations, clinics, and emergency havens.</p>
            </div>
          </header>

          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title" style={{ marginBottom: "20px" }}>
              <div>
                <h2>Safe Destinations Near You</h2>
                <p>Click navigate to open Google Maps live directions directly.</p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: "18px",
              }}
            >
              {SAFE_PLACES.map((place, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #fff7fa 100%)",
                    border: "1px solid #f5edf0",
                    borderRadius: "18px",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 4px 15px rgba(154, 56, 91, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "36px" }}>{place.icon}</span>
                  <strong style={{ fontSize: "15px", color: "#1e293b" }}>{place.name}</strong>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(place.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", width: "100%" }}
                  >
                    <button
                      type="button"
                      className="map-button"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <FiNavigation /> Navigate
                    </button>
                  </a>
                </div>
              ))}
            </div>
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

export default SafePlaces;