import "../styles/footer.css";

function Footer() {

    return (

        <footer className="footer">

            <div className="footer-container">

                <div className="footer-about">

                    <h2>

                        🛡 SafeHer

                    </h2>

                    <p>

                        Making every woman feel safer,
                        stronger and more confident
                        on every journey.

                    </p>

                </div>

                <div className="footer-links">

                    <h3>

                        Quick Links

                    </h3>

                    <a href="#">Home</a>

                    <a href="#features">Features</a>

                    <a href="#about">About</a>

                    <a href="#faq">FAQ</a>

                </div>

                <div className="footer-features">

                    <h3>

                        Features

                    </h3>

                    <p>🚨 Emergency SOS</p>

                    <p>📍 Live Tracking</p>

                    <p>📞 Trusted Contacts</p>

                    <p>⚠️ Unsafe Reports</p>

                </div>

                <div className="footer-contact">

                    <h3>

                        Contact

                    </h3>

                    <p>

                        support@safeher.in

                    </p>

                    <p>

                        +91 9876543210

                    </p>

                </div>

            </div>

            <div className="copyright">

                © 2026 SafeHer | All Rights Reserved

            </div>

        </footer>

    );

}

export default Footer;