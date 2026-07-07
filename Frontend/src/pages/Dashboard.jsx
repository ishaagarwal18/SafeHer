import { Link } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {

    // Temporary data
    // Will come from Django API later

    const journey_count = 0;
    const contact_count = 0;
    const sos_count = 0;

    const contact = [];

    return (

        <div className="container">

            <div className="top-section">

                <h1>

                    Welcome to SafeHer 💖

                </h1>

                <p>

                    Stay protected and connected.

                </p>

                <Link
                    to="/"
                    className="logout-btn"
                >

                    Logout

                </Link>

            </div>

            <div className="stats">

                <div className="stat-card">

                    <h2>

                        {journey_count}

                    </h2>

                    <p>

                        Journeys

                    </p>

                </div>

                <div className="stat-card">

                    <h2>

                        {contact_count}

                    </h2>

                    <p>

                        Contacts

                    </p>

                </div>

                <div className="stat-card">

                    <h2>

                        {sos_count}

                    </h2>

                    <p>

                        SOS Alerts

                    </p>

                </div>

            </div>

            <div className="grid">

                <div className="feature-card sos-card">

                    <h2>

                        🚨 SOS

                    </h2>

                    <p>

                        Trigger emergency alert

                    </p>

                    <Link to="/sos">

                        Open

                    </Link>

                </div>

                <div className="feature-card">

                    <h2>

                        📞 Emergency Contacts

                    </h2>

                    <p>

                        Manage trusted people

                    </p>

                    <Link to="/contacts">

                        Open

                    </Link>

                </div>

                <div className="feature-card">

                    <h2>

                        🚖 Start Journey

                    </h2>

                    <p>

                        Begin safe travel tracking

                    </p>

                    <Link to="/journey">

                        Open

                    </Link>

                </div>

                <div className="feature-card">

                    <h2>

                        📍 Nearby Safe Places

                    </h2>

                    <p>

                        Hospitals & police stations

                    </p>

                    <Link to="/safe-places">

                        Open

                    </Link>

                </div>

                <div className="feature-card">

                    <h2>

                        ⚠️ Report Unsafe Area

                    </h2>

                    <p>

                        Help others stay safe

                    </p>

                    <Link to="/report">

                        Open

                    </Link>

                </div>

                <div className="feature-card">

                    <h2>

                        🧭 Journey History

                    </h2>

                    <p>

                        View previous trips

                    </p>

                    <Link to="/history">

                        Open

                    </Link>

                </div>

            </div>

            <div className="quick-section">

                <h2>

                    Trusted Contacts

                </h2>

                {

                    contact.length > 0 ?

                    contact.map((person,index)=>(

                        <div
                            className="contact-box"
                            key={index}
                        >

                            <strong>

                                {person.contact_name}

                            </strong>

                            {" • "}

                            {person.phone_number}

                            {" • "}

                            {person.relationship}

                        </div>

                    ))

                    :

                    <div className="contact-box">

                        No Trusted Contacts Added

                    </div>

                }

            </div>

        </div>

    );

}

export default Dashboard;