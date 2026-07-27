import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import api from "../services/api";

function JourneyHistory() {
    const [journeys, setJourneys] = useState([]);

    useEffect(() => {
        api.get("journey/")
            .then((res) => setJourneys(Array.isArray(res.data) ? res.data : (res.data?.results || [])))
            .catch(() => setJourneys([]));
    }, []);

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">
                    🧭 Journey History
                </h1>

                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(journeys) && journeys.length > 0 ? (
                                journeys.map((j) => (
                                    <tr key={j.id}>
                                        <td>{j.source}</td>
                                        <td>{j.destination}</td>
                                        <td>{j.status}</td>
                                    </tr>
                                ))
                            ) : (
                                <>
                                    <tr>
                                        <td>College</td>
                                        <td>Home</td>
                                        <td>Safe</td>
                                    </tr>
                                    <tr>
                                        <td>Office</td>
                                        <td>Home</td>
                                        <td>Safe</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
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

export default JourneyHistory;