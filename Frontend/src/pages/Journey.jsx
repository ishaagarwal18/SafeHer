import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import api from "../services/api";

function Journey() {
    const [journeys, setJourneys] = useState([]);
    const [form, setForm] = useState({ source: "", destination: "", transport: "Car" });

    const fetchJourneys = async () => {
        try {
            const res = await api.get("journey/");
            setJourneys(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (err) {
            console.log(err);
            setJourneys([]);
        }
    };

    useEffect(() => {
        fetchJourneys();
    }, []);

    const [msg, setMsg] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        try {
            const res = await api.post("journey/", form);
            setForm({ source: "", destination: "", transport: "Car" });
            setMsg(res.data?.message || "🚖 Journey started successfully!");
            fetchJourneys();
        } catch (err) {
            console.log(err);
            setMsg(err.response?.data?.error || "Failed to start journey.");
        }
    };

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">
                    🚖 Start Journey
                </h1>

                {msg && (
                    <div style={{
                        background: "#dcfce7",
                        border: "1px solid #bbf7d0",
                        color: "#15803d",
                        padding: "14px 20px",
                        borderRadius: "16px",
                        marginBottom: "20px",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "16px"
                    }}>
                        {msg}
                    </div>
                )}

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="source"
                            placeholder="Source"
                            value={form.source}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="destination"
                            placeholder="Destination"
                            value={form.destination}
                            onChange={handleChange}
                        />

                        <select name="transport" value={form.transport} onChange={handleChange}>
                            <option>Car</option>
                            <option>Bus</option>
                            <option>Train</option>
                        </select>

                        <button type="submit" className="btn">
                            Start Journey
                        </button>
                    </form>

                    <table>
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Destination</th>
                                <th>Transport</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(journeys) && journeys.map((j) => (
                                <tr key={j.id}>
                                    <td>{j.source}</td>
                                    <td>{j.destination}</td>
                                    <td>{j.transport_mode}</td>
                                    <td>{j.status}</td>
                                </tr>
                            ))}
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

export default Journey;