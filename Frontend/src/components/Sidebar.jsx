import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/sos", label: "Emergency SOS", icon: "🚨" },
    { path: "/contacts", label: "Trusted Contacts", icon: "📞" },
    { path: "/journey", label: "Start Journey", icon: "🚖" },
    { path: "/history", label: "Trip History", icon: "🧭" },
    { path: "/safe-places", label: "Safe Places", icon: "📍" },
    { path: "/report", label: "Report Unsafe Area", icon: "⚠️" },
    { path: "/profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>🛡 SafeHer</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
