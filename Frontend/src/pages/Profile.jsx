import { useState } from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { FiUser, FiShield, FiSave, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/journey.css";
import "../styles/features.css";

function Profile() {
  const { user, updateUser } = useAuth();
  const userData = user || JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState(userData.name || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [medicalNotes, setMedicalNotes] = useState(userData.medicalNotes || "");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      phone: phone.trim(),
      medicalNotes: medicalNotes.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiUser />
            </span>
            <div>
              <p className="eyebrow">SAFEHER ACCOUNT MANAGEMENT</p>
              <h1>My Account & Safety Profile</h1>
              <p>Manage your account details, emergency contact numbers, and medical notes.</p>
            </div>
          </header>

          <div className="history-card" style={{ maxWidth: "720px", marginBottom: "24px" }}>
            {/* Avatar & User Details */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, #ff4f81, #e93870)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  boxShadow: "0 10px 24px rgba(255, 79, 129, 0.3)",
                  flexShrink: 0,
                }}
              >
                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "24px", color: "#1e293b" }}>
                  {userData.name || "SafeHer User"}
                </h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                  ✉️ {userData.email || "No email provided"}
                </p>
                {userData.phone && (
                  <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "14px" }}>
                    📞 {userData.phone}
                  </p>
                )}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "8px",
                    background: "#ecfdf5",
                    color: "#047857",
                    padding: "4px 12px",
                    borderRadius: "99px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  <FiShield /> SafeHer Shield Protected
                </span>
              </div>
            </div>

            {saved && (
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#047857",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginBottom: "20px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FiCheckCircle /> Profile settings saved successfully!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700, fontSize: "13.5px", color: "#536174" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700, fontSize: "13.5px", color: "#536174" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData.email || ""}
                  disabled
                  style={{ opacity: 0.7, background: "#f8fafc" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700, fontSize: "13.5px", color: "#536174" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 700, fontSize: "13.5px", color: "#536174" }}>
                  Emergency Medical Notes / Instructions
                </label>
                <textarea
                  rows="3"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Blood group, medical conditions, allergies, or emergency contact note..."
                />
              </div>

              <button type="submit" className="journey-start-button" style={{ width: "100%", margin: 0 }}>
                <FiSave /> Save Profile Changes
              </button>
            </form>
          </div>

          <div style={{ marginTop: "28px" }}>
            <Link to="/dashboard" className="back-to-dashboard-btn">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
=======
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

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="back-dashboard-btn">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
  );
}

export default Profile;
<<<<<<< HEAD
=======

>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
