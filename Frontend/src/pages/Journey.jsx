import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function Journey() {
    const [journeys, setJourneys] = useState([]);
    const [form, setForm] = useState({ source: "", destination: "", transport: "Car" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dashboardApi.get("api/journey/")
            .then((res) => setJourneys(res.data))
            .catch(() => {});
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const openGoogleMaps = (source, destination, transport) => {
        let mode = 'driving';
        if (transport && (transport.toLowerCase() === 'bus' || transport.toLowerCase() === 'train')) {
            mode = 'transit';
        }
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
        window.open(url, '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await dashboardApi.post("api/journey/", form);
            const newJourney = res.data || {
                source: form.source,
                destination: form.destination,
                transport_mode: form.transport,
                status: "Started"
            };
            setJourneys((prev) => [newJourney, ...prev]);
            openGoogleMaps(form.source, form.destination, form.transport);
            setForm({ source: "", destination: "", transport: "Car" });
        } catch (err) {
            const fallbackJourney = {
                source: form.source,
                destination: form.destination,
                transport_mode: form.transport,
                status: "Started"
            };
            setJourneys((prev) => [fallbackJourney, ...prev]);
            openGoogleMaps(form.source, form.destination, form.transport);
            setError(err.response?.data?.error || "");
            setForm({ source: "", destination: "", transport: "Car" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <h1 className="page-title">Start Journey</h1>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="source"
                            placeholder="Source"
                            value={form.source}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="destination"
                            placeholder="Destination"
                            value={form.destination}
                            onChange={handleChange}
                            required
                        />
                        <select name="transport" value={form.transport} onChange={handleChange}>
                            <option>Car</option>
                            <option>Bus</option>
                            <option>Train</option>
                        </select>
                        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? "Starting..." : "Start Journey"}
                        </button>
                    </form>

                    <table>
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Transport</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journeys.length > 0 ? (
                                journeys.map((j, i) => (
                                    <tr key={j.id || i}>
                                        <td>{j.source}</td>
                                        <td>{j.destination}</td>
                                        <td>{j.transport_mode || j.transport}</td>
                                        <td>
                                            <span className="status-pill">{j.status || "Started"}</span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-sm"
                                                onClick={() => openGoogleMaps(j.source, j.destination, j.transport_mode || j.transport)}
                                            >
                                                Open Map
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>No Journey Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nav-links">
                <Link to="/dashboard" className="btn">Back to Dashboard</Link>
            </div>
        </>
    );
}

export default Journey;