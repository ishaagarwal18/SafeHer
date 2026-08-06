import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

const features = [
    {
        icon: "🛡️",
        title: "SOS Emergency Alert",
        desc: "Trigger an instant SOS with one tap. Alerts your trusted contacts with your live location.",
        route: "/sos",
    },
    {
        icon: "🗺️",
        title: "Safe Journey Tracking",
        desc: "Share your route in real time. Get safe check-ins and arrival confirmations.",
        route: "/journey",
    },
    {
        icon: "📍",
        title: "Nearby Safe Places",
        desc: "Discover hospitals, police stations, and pharmacies near you in seconds.",
        route: "/safe-places",
    },
    {
        icon: "👯‍♀️",
        title: "Trusted Contacts",
        desc: "Build your circle of trust. Keep loved ones informed at every step.",
        route: "/contacts",
    },
    {
        icon: "📸",
        title: "Evidence Capture",
        desc: "Silently capture photos, audio and video during an SOS session.",
        route: "/sos",
    },
    {
        icon: "📊",
        title: "Safety Reports",
        desc: "Report unsafe areas and help build safer communities for all women.",
        route: "/report",
    },
];

const stats = [
    { value: "50K+", label: "Women Protected" },
    { value: "1M+", label: "Safe Journeys" },
    { value: "200+", label: "Cities Covered" },
    { value: "4.9★", label: "User Rating" },
];

const steps = [
    { num: "01", title: "Create Your Account", desc: "Sign up in under a minute with just your email and phone number." },
    { num: "02", title: "Add Trusted Contacts", desc: "Add family and friends who will be alerted when you need help." },
    { num: "03", title: "Start Your Journey", desc: "Enable journey tracking and travel with peace of mind." },
    { num: "04", title: "Stay Safe, Always", desc: "Use SOS, safe places, and reports to protect yourself every day." },
];

export default function Home() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [modal, setModal] = useState(null); // { title, route } | null

    const handleFeatureClick = (feature) => {
        if (isAuthenticated) {
            navigate(feature.route);
        } else {
            setModal({ title: feature.title, route: feature.route });
        }
    };

    return (
        <div className="home-root">

            {/* ── LOGIN REQUIRED MODAL ── */}
            {modal && (
                <div className="hn-modal-backdrop" onClick={() => setModal(null)}>
                    <div className="hn-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="hn-modal-close" onClick={() => setModal(null)} aria-label="Close">✕</button>
                        <div className="hn-modal-icon">🔒</div>
                        <h3 className="hn-modal-title">Login Required</h3>
                        <p className="hn-modal-desc">
                            You need to be logged in to access <strong>{modal.title}</strong>.
                        </p>
                        <div className="hn-modal-actions">
                            <Link
                                to="/login"
                                state={{ from: { pathname: modal.route } }}
                                className="hn-modal-btn-primary"
                                onClick={() => setModal(null)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="hn-modal-btn-ghost"
                                onClick={() => setModal(null)}
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NAVBAR ── */}
            <nav className="hn-nav">
                <div className="hn-logo">
                    <span className="hn-logo-icon">🛡</span>
                    SafeHer
                </div>
                <div className="hn-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how">How it works</a>
                    <a href="#stats">Impact</a>
                    <Link to="/login" className="hn-login-btn">Login</Link>
                    <Link to="/signup" className="hn-signup-btn">Get Started</Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hn-hero">
                {/* background image tiles */}
                <div className="hn-hero-bg">
                    <div className="hn-bg-img hn-bg-img-1" />
                    <div className="hn-bg-img hn-bg-img-2" />
                    <div className="hn-bg-img hn-bg-img-3" />
                    <div className="hn-hero-overlay" />
                </div>

                <div className="hn-hero-content">
                    <div className="hn-hero-badge">✨ Safety First, Always</div>
                    <h1 className="hn-hero-title">
                        Every Woman Deserves to<br />
                        <span className="hn-gradient-text">Feel Safe Everywhere</span>
                    </h1>
                    <p className="hn-hero-sub">
                        SafeHer empowers women with real-time SOS alerts, journey tracking,
                        evidence capture and a trusted support network — all in one app.
                    </p>
                    <div className="hn-hero-btns">
                        <Link to="/signup" className="hn-btn-primary">Start for Free →</Link>
                        <a href="#features" className="hn-btn-ghost">See Features</a>
                    </div>
                    <div className="hn-hero-avatars">
                        <div className="hn-avatars-row">
                            {["👩🏽", "👩🏻", "👩🏾", "👩🏼", "👩🏿"].map((e, i) => (
                                <span key={i} className="hn-avatar">{e}</span>
                            ))}
                        </div>
                        <span className="hn-avatar-label">Trusted by 50,000+ women</span>
                    </div>
                </div>

                {/* floating phone mockup */}
                <div className="hn-hero-visual">
                    <div className="hn-phone-frame">
                        <div className="hn-phone-screen">
                            <div className="hn-ps-header">
                                <span className="hn-ps-name">SafeHer</span>
                                <span className="hn-ps-status">🟢 Safe</span>
                            </div>
                            <div className="hn-sos-btn-wrap">
                                <div className="hn-sos-ring" />
                                <div className="hn-sos-ring hn-sos-ring-2" />
                                <button className="hn-sos-demo">SOS</button>
                            </div>
                            <p className="hn-ps-hint">Hold to send emergency alert</p>
                            <div className="hn-ps-contacts">
                                {["Mom 👩", "Sis 👧", "Riya 👩‍🦱"].map((c, i) => (
                                    <div key={i} className="hn-ps-contact">{c}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hn-floating-badge hn-fb-1">📍 Location Shared</div>
                    <div className="hn-floating-badge hn-fb-2">✅ Contacts Notified</div>
                    <div className="hn-floating-badge hn-fb-3">🏥 Hospital Nearby</div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="hn-stats" id="stats">
                {stats.map((s, i) => (
                    <div key={i} className="hn-stat-item">
                        <div className="hn-stat-value">{s.value}</div>
                        <div className="hn-stat-label">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ── FEATURES ── */}
            <section className="hn-features" id="features">
                <div className="hn-section-label">What We Offer</div>
                <h2 className="hn-section-title">Everything You Need to Stay Safe</h2>
                <p className="hn-section-sub">
                    Designed by women, for women — a complete safety ecosystem in your pocket.
                </p>
                <div className="hn-features-grid">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="hn-feature-card"
                            onClick={() => handleFeatureClick(f)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleFeatureClick(f)}
                            aria-label={`Open ${f.title}`}
                        >
                            <div className="hn-feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                            {!isAuthenticated && (
                                <span className="hn-feature-lock" title="Login required">🔒</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="hn-how" id="how">
                <div className="hn-how-bg" />
                <div className="hn-how-inner">
                    <div className="hn-section-label">Simple & Fast</div>
                    <h2 className="hn-section-title">How SafeHer Works</h2>
                    <div className="hn-steps">
                        {steps.map((s, i) => (
                            <div key={i} className="hn-step">
                                <div className="hn-step-num">{s.num}</div>
                                <div className="hn-step-body">
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── GALLERY STRIP ── */}
            <section className="hn-gallery">
                <div className="hn-gallery-track">
                    {[
                        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
                    ].map((src, i) => (
                        <div key={i} className="hn-gallery-item">
                            <img src={src} alt="women empowerment" loading="lazy" />
                            <div className="hn-gallery-overlay" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="hn-cta">
                <div className="hn-cta-blob hn-cta-blob-1" />
                <div className="hn-cta-blob hn-cta-blob-2" />
                <div className="hn-cta-inner">
                    <div className="hn-cta-emoji">💪</div>
                    <h2>Your Safety is Non-Negotiable</h2>
                    <p>Join thousands of women who trust SafeHer every single day.</p>
                    <Link to="/signup" className="hn-btn-primary hn-cta-btn">
                        Create Free Account →
                    </Link>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="hn-footer">
                <div className="hn-footer-top">
                    <div className="hn-footer-brand">
                        <div className="hn-footer-logo">🛡 SafeHer</div>
                        <p>Empowering women with technology for a safer, braver world.</p>
                        <div className="hn-footer-socials">
                            <a href="#" aria-label="Instagram">📸</a>
                            <a href="#" aria-label="Twitter">🐦</a>
                            <a href="#" aria-label="Facebook">📘</a>
                            <a href="#" aria-label="LinkedIn">💼</a>
                        </div>
                    </div>

                    <div className="hn-footer-col">
                        <h4>Product</h4>
                        <a href="#features">Features</a>
                        <a href="#how">How It Works</a>
                        <a href="#stats">Our Impact</a>
                    </div>

                    <div className="hn-footer-col">
                        <h4>Account</h4>
                        <Link to="/signup">Sign Up</Link>
                        <Link to="/login">Login</Link>
                    </div>

                    <div className="hn-footer-col">
                        <h4>Support</h4>
                        <a href="#">Help Center</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Us</a>
                    </div>
                </div>

                <div className="hn-footer-bottom">
                    <span>© 2026 SafeHer. All rights reserved.</span>
                    <span>Made with 💗 for every woman's safety</span>
                </div>
            </footer>
        </div>
    );
}
