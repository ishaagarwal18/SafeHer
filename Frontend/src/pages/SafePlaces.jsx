import { Link } from "react-router-dom";
import "../styles/features.css";

function SafePlaces() {
    return (
        <div className="feature-page">
            <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", padding: "20px" }}>

                <h1 className="page-title" style={{ width: "100%", textAlign: "center", marginBottom: "25px" }}>📍 Nearby Safe Places</h1>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🏥 Civil Hospital <br /><br />
                    <a href="https://www.google.com/maps/search/Civil+Hospital+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    👮 Police Station <br /><br />
                    <a href="https://www.google.com/maps/search/Police+Station+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    💊 Pharmacy <br /><br />
                    <a href="https://www.google.com/maps/search/Pharmacy+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🚑 Emergency Hospital <br /><br />
                    <a href="https://www.google.com/maps/search/Emergency+Hospital+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    👩 Women's Police Station <br /><br />
                    <a href="https://www.google.com/maps/search/Women+Police+Station+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🚒 Fire Station <br /><br />
                    <a href="https://www.google.com/maps/search/Fire+Station+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🛡️ Women Help Center <br /><br />
                    <a href="https://www.google.com/maps/search/Women+Help+Center+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🏥 24×7 Clinic <br /><br />
                    <a href="https://www.google.com/maps/search/24+Hours+Clinic+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🚖 Taxi Stand <br /><br />
                    <a href="https://www.google.com/maps/search/Taxi+Stand+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🚌 Bus Stop <br /><br />
                    <a href="https://www.google.com/maps/search/Bus+Stop+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🚉 Railway Station <br /><br />
                    <a href="https://www.google.com/maps/search/Railway+Station+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    ⛽ Petrol Pump <br /><br />
                    <a href="https://www.google.com/maps/search/Petrol+Pump+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🏦 ATM / Bank <br /><br />
                    <a href="https://www.google.com/maps/search/ATM+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    🏬 Shopping Mall <br /><br />
                    <a href="https://www.google.com/maps/search/Shopping+Mall+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

                <div className="card" style={{ width: "190px", padding: "15px", textAlign: "center", borderRadius: "12px" }}>
                    ☕ 24×7 Café <br /><br />
                    <a href="https://www.google.com/maps/search/24+Hours+Cafe+near+me" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="btn" style={{ padding: "8px 18px", fontSize: "14px", cursor: "pointer" }}>Navigate</button>
                    </a>
                </div>

            </div>

            <div className="nav-links">
                <Link to="/dashboard" className="btn">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default SafePlaces;