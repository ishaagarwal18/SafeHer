import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";

const BACKEND_SAFE_PLACES = [
  {
    id: 1,
    name: "Civil Hospital",
    icon: "🏥",
    category: "Medical",
    query: "Civil+Hospital+near+me",
    desc: "District government medical facility for immediate care & emergencies."
  },
  {
    id: 2,
    name: "Police Station",
    icon: "👮",
    category: "Police & Safety",
    query: "Police+Station+near+me",
    desc: "Local police station for law enforcement & emergency assistance."
  },
  {
    id: 3,
    name: "Pharmacy",
    icon: "💊",
    category: "Medical",
    query: "Pharmacy+near+me",
    desc: "24/7 medical store for emergency medicines & supplies."
  },
  {
    id: 4,
    name: "Emergency Hospital",
    icon: "🚑",
    category: "Medical",
    query: "Emergency+Hospital+near+me",
    desc: "Trauma care & 24/7 emergency medical hospital."
  },
  {
    id: 5,
    name: "Women's Police Station",
    icon: "👩",
    category: "Police & Safety",
    query: "Women+Police+Station+near+me",
    desc: "Specialized women help desk & female police officers."
  },
  {
    id: 6,
    name: "Fire Station",
    icon: "🚒",
    category: "Police & Safety",
    query: "Fire+Station+near+me",
    desc: "Emergency fire & rescue response station."
  },
  {
    id: 7,
    name: "Women Help Center",
    icon: "🛡️",
    category: "Police & Safety",
    query: "Women+Help+Center+near+me",
    desc: "Safe haven, legal counseling & crisis intervention support."
  },
  {
    id: 8,
    name: "24×7 Clinic",
    icon: "🏥",
    category: "Medical",
    query: "24+Hours+Clinic+near+me",
    desc: "Round-the-clock doctor consultation & first aid."
  },
  {
    id: 9,
    name: "Taxi Stand",
    icon: "🚖",
    category: "Transit",
    query: "Taxi+Stand+near+me",
    desc: "Verified cab & taxi pickup hub for safe transport."
  },
  {
    id: 10,
    name: "Bus Stop",
    icon: "🚌",
    category: "Transit",
    query: "Bus+Stop+near+me",
    desc: "Public bus stop with regular transit schedules."
  },
  {
    id: 11,
    name: "Railway Station",
    icon: "🚉",
    category: "Transit",
    query: "Railway+Station+near+me",
    desc: "Train station with RPF police booth & passenger lounge."
  },
  {
    id: 12,
    name: "Petrol Pump",
    icon: "⛽",
    category: "Services",
    query: "Petrol+Pump+near+me",
    desc: "Well-lit 24/7 fuel station with CCTV & staff presence."
  },
  {
    id: 13,
    name: "ATM / Bank",
    icon: "🏦",
    category: "Services",
    query: "ATM+near+me",
    desc: "24/7 guarded bank ATM booth for cash emergency."
  },
  {
    id: 14,
    name: "Shopping Mall",
    icon: "🏬",
    category: "Services",
    query: "Shopping+Mall+near+me",
    desc: "Public commercial mall with security guards & surveillance."
  },
  {
    id: 15,
    name: "24×7 Café",
    icon: "☕",
    category: "Services",
    query: "24+Hours+Cafe+near+me",
    desc: "Open coffee shop with public crowd & bright lighting."
  }
];

function SafePlaces() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const categories = ["All", "Police & Safety", "Medical", "Transit", "Services"];

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationStatus("Detecting current coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);
        setLocationStatus(`📍 Located (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
      },
      () => {
        setLocating(false);
        setLocationStatus("Unable to retrieve location. Defaulting to general search.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getMapUrl = (place) => {
    if (userLocation) {
      return `https://www.google.com/maps/search/${encodeURIComponent(place.name)}/@${userLocation.lat},${userLocation.lng},15z`;
    }
    return `https://www.google.com/maps/search/${place.query}`;
  };

  const filteredPlaces = BACKEND_SAFE_PLACES.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || place.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container">
      <h1 className="page-title">📍 Nearby Safe Places</h1>

      {/* Emergency Hotlines Bar */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
          border: "1.5px solid #fecaca"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <h3 style={{ color: "#991b1b", fontSize: "16px", fontWeight: "800", marginBottom: "4px" }}>
              🚨 Emergency Quick Dial Hotlines
            </h3>
            <p style={{ color: "#7f1d1d", fontSize: "13.5px" }}>
              In immediate danger? Tap to call national safety helplines right away.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href="tel:112" className="btn btn-danger" style={{ padding: "8px 16px", fontSize: "13px" }}>
              📞 112 (National SOS)
            </a>
            <a href="tel:1091" className="btn" style={{ padding: "8px 16px", fontSize: "13px", background: "linear-gradient(135deg, #db2777, #be123c)" }}>
              👩 1091 (Women Helpline)
            </a>
            <a href="tel:100" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              👮 100 (Police)
            </a>
            <a href="tel:108" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              🚑 108 (Ambulance)
            </a>
          </div>
        </div>
      </div>

      {/* Search & Location Bar Card */}
      <div className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: "1 1 300px", display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="🔍 Search safe place type (e.g. Police, Hospital, Bus...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleDetectLocation}
              className="btn btn-secondary"
              disabled={locating}
              style={{ fontSize: "13.5px" }}
            >
              {locating ? "Locating..." : "📍 Use My GPS Location"}
            </button>
          </div>
        </div>

        {locationStatus && (
          <p style={{ marginTop: "12px", fontSize: "13px", color: userLocation ? "#047857" : "#64748b", fontWeight: "600" }}>
            {locationStatus}
          </p>
        )}

        {/* Category Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn-sm ${categoryFilter === cat ? "btn" : "btn-secondary"}`}
              style={{
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "13px",
                border: categoryFilter === cat ? "none" : "1px solid var(--card-border)"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 15 Safe Places Category Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "24px"
        }}
      >
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="card"
              style={{
                margin: 0,
                padding: "20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px"
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #ffe4ec, #fce7f0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  boxShadow: "0 4px 12px rgba(255, 79, 129, 0.15)"
                }}
              >
                {place.icon}
              </div>

              <div>
                <h3 style={{ fontSize: "16.5px", fontWeight: "700", color: "#be123c", marginBottom: "4px" }}>
                  {place.name}
                </h3>
                <span className="status-pill pending" style={{ fontSize: "11px", marginBottom: "8px" }}>
                  {place.category}
                </span>
                <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.4", marginTop: "6px" }}>
                  {place.desc}
                </p>
              </div>

              <a
                href={getMapUrl(place)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ width: "100%", padding: "10px 14px", fontSize: "13.5px" }}
              >
                🗺 Navigate
              </a>
            </div>
          ))
        ) : (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "16px", color: "#64748b" }}>No matching safe places found for "{searchTerm}".</p>
          </div>
        )}
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default SafePlaces;