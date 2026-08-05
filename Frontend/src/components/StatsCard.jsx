function StatsCard({ number, label, icon, color = "#db2777" }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      {icon && <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{icon}</div>}
      <h2 style={{ color }}>{number}</h2>
      <p>{label}</p>
    </div>
  );
}

export default StatsCard;
