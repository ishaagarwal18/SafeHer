import { Link } from "react-router-dom";
import "../styles/features.css";

const SAFE_PLACES = [
  { name: "🏥 Civil Hospital", query: "Civil Hospital near me" },
  { name: "👮 Police Station", query: "Police Station near me" },
  { name: "💊 Pharmacy", query: "Pharmacy near me" },
  { name: "🚑 Emergency Hospital", query: "Emergency Hospital near me" },
  { name: "👩 Women's Police Station", query: "Women Police Station near me" },
  { name: "🚒 Fire Station", query: "Fire Station near me" },
  { name: "🛡️ Women Help Center", query: "Women Help Center near me" },
  { name: "🏥 24×7 Clinic", query: "24 Hours Clinic near me" },
  { name: "🚖 Taxi Stand", query: "Taxi Stand near me" },
  { name: "🚌 Bus Stop", query: "Bus Stop near me" },
  { name: "🚉 Railway Station", query: "Railway Station near me" },
  { name: "⛽ Petrol Pump", query: "Petrol Pump near me" },
  { name: "🏦 ATM / Bank", query: "ATM near me" },
  { name: "🏬 Shopping Mall", query: "Shopping Mall near me" },
  { name: "☕ 24×7 Café", query: "24 Hours Cafe near me" },
];

function SafePlaces() {
  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          padding: "20px"
        }}
      >
        <h1 className="page-title" style={{ width: "100%", textAlign: "center", marginBottom: "25px" }}>
          📍 Nearby Safe Places
        </h1>

        {SAFE_PLACES.map((place, idx) => (
          <div
            className="card"
            key={idx}
            style={{
              width: "190px",
              padding: "15px",
              textAlign: "center",
              borderRadius: "12px"
            }}
          >
            {place.name} <br />
            <br />
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(place.query)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>
                Navigate
              </button>
            </a>
          </div>
        ))}
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="btn">
          Back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default SafePlaces;