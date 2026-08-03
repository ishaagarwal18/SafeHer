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

      <div className="card" style={{ maxWidth: "640px", margin: "0 auto 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #be123c, #db2777)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold",
              boxShadow: "0 8px 20px rgba(219, 39, 119, 0.25)"
            }}
          >
            {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px" }}>{userData.name || userData.username || "SafeHer User"}</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
              {userData.email || "user@safeher.org"}
            </p>
            <span className="status-pill completed" style={{ marginTop: "6px" }}>
              🛡️ Account Protected
            </span>
          </div>
        </div>

        {saved && (
          <div className="alert-box alert-success" style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", margin: 0 }}>✅ Profile settings updated successfully!</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>Full Name</label>
            <input type="text" defaultValue={userData.name || ""} placeholder="Full Name" />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>Email Address</label>
            <input type="email" defaultValue={userData.email || ""} disabled style={{ opacity: 0.7, background: "#f8fafc" }} />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>Phone Number</label>
            <input type="tel" defaultValue={userData.phone || ""} placeholder="10-digit mobile number" />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13.5px" }}>
              Emergency Medical Note / Instructions
            </label>
            <textarea rows="3" placeholder="Blood group, allergies, or emergency contact note..."></textarea>
          </div>

          <button type="submit" className="btn" style={{ width: "100%", padding: "14px", fontSize: "15px" }}>
            💾 Save Profile Changes
          </button>
        </form>
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Profile;

