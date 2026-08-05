import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "./EditProfileModal";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const popupRef = useRef(null);
  const avatarRef = useRef(null);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Close popup on outside click
  useEffect(() => {
    function handle(e) {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  const handleOpenEdit = () => {
    setOpen(false);
    setEditModalOpen(true);
  };

  return (
    <div className="dl-wrapper">
      {/* Top navbar */}
      <header className="dl-navbar">
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <span className="dl-brand">🛡️ SafeHer</span>
        </Link>

        <div className="dl-avatar-wrap">
          <button
            ref={avatarRef}
            className="dl-avatar"
            onClick={() => setOpen((p) => !p)}
            title="Account Menu"
          >
            {initial}
          </button>

          {open && (
            <div ref={popupRef} className="dl-popup">
              <div
                className="dl-popup-avatar"
                onClick={handleOpenEdit}
                title="Click to edit profile info"
                style={{ cursor: "pointer" }}
              >
                {initial}
                <span className="dl-popup-avatar-badge">✏️</span>
              </div>
              <div className="dl-popup-name">{user?.name || "User"}</div>
              {user?.email && <div className="dl-popup-meta">{user.email}</div>}
              {user?.phone && <div className="dl-popup-meta">📞 {user.phone}</div>}

              <button className="dl-popup-edit" onClick={handleOpenEdit}>
                ✏️ Edit Profile Info
              </button>

              <button className="dl-popup-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="dl-content">
        {children}
      </main>

      {/* Quick Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
}

export default DashboardLayout;

