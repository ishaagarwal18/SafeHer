import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";

const DEFAULT_PLACES = [
  { name: "Central Police Station & Women Cell", category: "Police Station", address: "Connaught Place, Central Zone", distance: "0.8 km", phone: "100 / 1091" },
  { name: "City Care Super Speciality Hospital", category: "Hospital", address: "Main Road Block C", distance: "1.2 km", phone: "102 / 108" },
  { name: "St. Mary 24x7 Emergency Pharmacy", category: "Pharmacy", address: "Market Complex Shop 14", distance: "0.5 km", phone: "+91 9876543210" },
  { name: "SheShelter Women Safe Haven & Hostel", category: "Safe Haven", address: "Green Park Avenue", distance: "2.1 km", phone: "+91 9811223344" },
  { name: "Metro Transit Police Helpdesk", category: "Police Station", address: "Central Metro Station Gate 2", distance: "1.5 km", phone: "1091" }
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
    <>
      <div className="container">
        <h1 className="page-title">📍 Nearby Safe Places & Emergency Support</h1>

        <div className="card">
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
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)" }}
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
    </>
  );
}

export default SafePlaces;