import { Link } from "react-router-dom";
import "../styles/style.css";

function Home() {
    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    SafeHer
                </div>
                <div className="nav-links">
                    <Link to="/login">
                        Login
                    </Link>
                    <Link to="/signup" className="signup-btn">
                        Sign Up
                    </Link>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-text">
                    <h1>
                        Your Safety, <span>Your Journey</span>
                    </h1>
                    <p>
                        Travel smarter and safer with emergency SOS alerts, safe journey tracking, nearby safe places and trusted contact support.
                    </p>
                    <Link to="/signup" className="btn">
                        Get Started
                    </Link>
                </div>

                <div className="hero-card">
                    <div className="card-title">
                        SafeHer Features
                    </div>

                    <div className="feature">
                        <h3>Safe Journey</h3>
                        <p>Track travel and get safe check-ins.</p>
                    </div>

                    <div className="feature">
                        <h3>SOS Emergency</h3>
                        <p>Send emergency alerts instantly.</p>
                    </div>

                    <div className="feature">
                        <h3>Nearby Safe Places</h3>
                        <p>Hospitals, police stations and pharmacies.</p>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;