import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";

const DEFAULT_PLACES = [
  { name: "Civil Hospital & Emergency Ward", category: "Hospital", address: "Civil Lines, Main Road", distance: "0.8 km", phone: "102 / 108" },
  { name: "Central Police Station & Women Cell", category: "Police Station", address: "Station Road, Zone 1", distance: "1.2 km", phone: "100 / 1091" },
  { name: "24x7 Emergency Pharmacy & Medicals", category: "Pharmacy", address: "Market Complex Shop 14", distance: "0.5 km", phone: "+91 9876543210" },
  { name: "Women Police Station & Helpdesk", category: "Police Station", address: "City Center Block B", distance: "1.5 km", phone: "1091" },
  { name: "24x7 Women Safe Haven Shelter", category: "Safe Haven", address: "Green Park Avenue", distance: "2.1 km", phone: "+91 9811223344" }
];

const CATEGORY_CARDS = [
  { title: "🏥 Civil Hospital", query: "Civil Hospital near me" },
  { title: "👮 Police Station", query: "Police Station near me" },
  { title: "💊 Pharmacy", query: "Pharmacy near me" },
  { title: "👩 Women Police Station", query: "Women Police Station near me" },
  { title: "🚑 Emergency Hospital", query: "Emergency Hospital near me" },
  { title: "🛡️ Women Help Center", query: "Women Help Center near me" },
  { title: "🚖 Taxi Stand", query: "Taxi Stand near me" },
  { title: "🚉 Railway / Metro Station", query: "Metro Station near me" },
];

function SafePlaces() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = DEFAULT_PLACES.filter((p) => {
    const matchesCategory = filter === "All" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="feature-page">
      <div className="container">
        <h1 className="page-title" style={{ textAlign: "center", marginBottom: "25px" }}>
          📍 Nearby Safe Places & Emergency Navigation
        </h1>

        {/* Quick GPS Navigation Cards */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "30px" }}>
          {CATEGORY_CARDS.map((card, idx) => (
            <div key={idx} className="card" style={{ width: "200px", padding: "16px", textAlign: "center", borderRadius: "16px" }}>
              <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "12px" }}>{card.title}</div>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(card.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button className="btn" style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", width: "100%" }}>
                  Navigate
                </button>
              </a>
            </div>
          ))}
        </div>

        {/* Searchable Safe Places Table */}
        <div className="card">
          <h2 style={{ marginBottom: "16px" }}>Verified Safe Places</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search by area or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "300px" }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            >
              <option value="All">All Categories</option>
              <option value="Police Station">Police Stations</option>
              <option value="Hospital">Hospitals</option>
              <option value="Pharmacy">24/7 Pharmacies</option>
              <option value="Safe Haven">Safe Havens / Shelters</option>
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>Facility Name</th>
                <th>Category</th>
                <th>Address</th>
                <th>Distance</th>
                <th>Emergency Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place, index) => (
                  <tr key={index}>
                    <td><strong>{place.name}</strong></td>
                    <td>
                      <span className="status-badge completed">
                        {place.category}
                      </span>
                    </td>
                    <td>{place.address}</td>
                    <td>{place.distance}</td>
                    <td>
                      <a href={`tel:${place.phone}`} style={{ color: "#db2777", fontWeight: "bold" }}>
                        📞 {place.phone}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                    No matching safe places found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="btn">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default SafePlaces;