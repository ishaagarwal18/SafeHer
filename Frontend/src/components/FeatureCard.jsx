import { Link } from "react-router-dom";

function FeatureCard({ icon, title, description, linkTo, isDanger }) {
  return (
    <div className={`feature-card ${isDanger ? "sos-card" : ""}`}>
      <h2>{icon} {title}</h2>
      <p>{description}</p>
      {linkTo && <Link to={linkTo}>Open</Link>}
    </div>
  );
}

export default FeatureCard;
