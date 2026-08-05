import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "./EditProfileModal";
import "../styles/sidebar.css";

const links = [
  { path: "/dashboard",   label: "Dashboard",         icon: "📊" },
  { path: "/sos",         label: "Emergency SOS",     icon: "🚨" },
  { path: "/contacts",    label: "Trusted Contacts",  icon: "📞" },
  { path: "/journey",     label: "Start Journey",     icon: "🚖" },
  { path: "/history",     label: "Trip History",      icon: "🧭" },
  { path: "/safe-places", label: "Safe Places",       icon: "📍" },
  { path: "/report",      label: "Report Unsafe Area",icon: "⚠️" },
  { path: "/profile",     label: "My Profile",        icon: "👤" },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [popupOpen, setPopupOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const popupRef  = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setPopupOpen(false);
    await logout();
    navigate("/login");
  };

  const handleOpenEdit = () => {
    setPopupOpen(false);
    setEditModalOpen(true);
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <aside className="sidebar">

      {/* Top bar: brand left, avatar right */}
      <div className="sidebar-topbar">
        <span className="sidebar-brand-text">🛡️ SafeHer</span>

        <div style={{ position: "relative" }}>
          <button
            ref={avatarRef}
            className="sidebar-avatar-btn"
            onClick={() => setPopupOpen((p) => !p)}
            title="Account Menu"
          >
            {initial}
          </button>

          {popupOpen && (
            <div ref={popupRef} className="sidebar-user-popup">
              <div
                className="sidebar-user-popup__avatar"
                onClick={handleOpenEdit}
                title="Click to edit profile info"
                style={{ cursor: "pointer", position: "relative" }}
              >
                {initial}
                <span className="sidebar-user-popup__avatar-badge">✏️</span>
              </div>
              <div className="sidebar-user-popup__name">{user?.name || "User"}</div>
              {user?.email && (
                <div className="sidebar-user-popup__meta">{user.email}</div>
              )}
              {user?.phone && (
                <div className="sidebar-user-popup__meta">📞 {user.phone}</div>
              )}

              <button className="sidebar-user-popup__edit" onClick={handleOpenEdit}>
                ✏️ Edit Profile Info
              </button>

              <button className="sidebar-user-popup__logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {links.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link${location.pathname === item.path ? " active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </aside>
  );
}

export default Sidebar;
