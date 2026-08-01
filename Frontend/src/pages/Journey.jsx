import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function Journey() {
    const [journeys, setJourneys] = useState([]);
    const [form, setForm] = useState({ source: "", destination: "", transport: "Car" });
    const [unsafeWarning, setUnsafeWarning] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dashboardApi.get("api/journey/")
            .then((res) => setJourneys(Array.isArray(res.data) ? res.data : []))
            .catch(() => setJourneys([]));
    }, []);

    const handleChange = (e) => {
        setUnsafeWarning("");
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const openGoogleMaps = (source, destination, transport) => {
        let mode = 'driving';
        if (transport && (transport.toLowerCase() === 'bus' || transport.toLowerCase() === 'train')) {
            mode = 'transit';
        }
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
        window.open(url, '_blank');
    };

    const handleSubmit = async (e, forceProceed = false) => {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const payload = { ...form, force: forceProceed || !!unsafeWarning };
            const res = await dashboardApi.post("api/journey/", payload);

            if (res.data?.unsafe_warning && !payload.force) {
                setUnsafeWarning(res.data.unsafe_warning);
                setLoading(false);
                return;
            }

            const newJourney = res.data?.journey || res.data?.id ? (res.data.journey || res.data) : {
                source: form.source,
                destination: form.destination,
                transport_mode: form.transport,
                status: "Active"
            };
            setJourneys((prev) => [newJourney, ...prev]);
            openGoogleMaps(form.source, form.destination, form.transport);
            setForm({ source: "", destination: "", transport: "Car" });
            setUnsafeWarning("");
        } catch (err) {
            const fallbackJourney = {
                source: form.source,
                destination: form.destination,
                transport_mode: form.transport,
                status: "Active"
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
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">🚖 Start Journey</h1>

                <div className="card">
                    <form onSubmit={(e) => handleSubmit(e, !!unsafeWarning)}>
                        {unsafeWarning && (
                            <div style={{
                                background: "#fff3cd",
                                border: "1px solid #ffc107",
                                color: "#856404",
                                padding: "14px 18px",
                                borderRadius: "12px",
                                marginBottom: "16px",
                                fontSize: "15px",
                                fontWeight: "600"
                            }}>
                                {unsafeWarning}<br />
                                <small style={{ fontWeight: "400" }}>You can still proceed by clicking 'Proceed Anyway'.</small>
                            </div>
                        )}

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
                            {loading ? "Starting..." : unsafeWarning ? "Proceed Anyway" : "Start Journey"}
                        </button>
                    </form>

                    <h2 style={{ marginTop: "24px", marginBottom: "12px" }}>Recent Journeys</h2>
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
                                        <td><strong>{j.source}</strong></td>
                                        <td><strong>{j.destination}</strong></td>
                                        <td>{j.transport_mode || j.transport}</td>
                                        <td>
                                            <span className="status-pill">{j.status || "Active"}</span>
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
                                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No Journey Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
                <Link to="/dashboard" className="btn">Back to Dashboard</Link>
            </div>
        </div>
    );
}

export default Journey;