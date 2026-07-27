import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/features.css";

function Profile() {
  const { user } = useAuth();
  const userData = user || JSON.parse(localStorage.getItem("user") || "{}");

  const [saved, setSaved] = useState(false);

  return (
    <div className="container">
      <h1 className="page-title">👤 My Account & Safety Profile</h1>

      <div className="card" style={{ maxWidth: "600px", margin: "0 auto 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6b21a8, #db2777)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "bold"
          }}>
            {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{userData.name || userData.username || "SafeHer User"}</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b" }}>{userData.email || "user@safeher.org"}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Full Name</label>
            <input type="text" defaultValue={userData.name || ""} placeholder="Full Name" />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Email Address</label>
            <input type="email" defaultValue={userData.email || ""} disabled style={{ opacity: 0.7 }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Phone Number</label>
            <input type="tel" defaultValue={userData.phone || ""} placeholder="10-digit mobile number" />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Emergency Note / Medical Info</label>
            <textarea rows="3" placeholder="Blood group, allergies, or emergency contact note..."></textarea>
          </div>

          {saved && <p style={{ color: "green", fontWeight: "bold" }}>Profile settings saved successfully!</p>}

          <button type="submit" className="btn">
            Save Profile
          </button>
        </form>
      </div>

      <div className="nav-links" style={{ textAlign: "center" }}>
        <Link to="/dashboard" className="btn">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Profile;
