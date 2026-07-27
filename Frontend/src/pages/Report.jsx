import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import api from "../services/api";

function Report() {
    const [reports, setReports] = useState([]);
    const [form, setForm] = useState({ area: "", issue: "", description: "" });

    const fetchReports = async () => {
        try {
            const res = await api.get("reports/");
            setReports(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (err) {
            console.log(err);
            setReports([]);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("reports/", form);
            setForm({ area: "", issue: "", description: "" });
            fetchReports();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">
                    ⚠️ Report Unsafe Area
                </h1>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="area"
                            placeholder="Area Name"
                            value={form.area}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="issue"
                            placeholder="Issue Type (e.g. Harassment, Poor Lighting)"
                            value={form.issue}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="description"
                            placeholder="Describe the issue..."
                            rows="4"
                            value={form.description}
                            onChange={handleChange}
                            required
                        ></textarea>

                        <button className="btn" type="submit">
                            Submit Report
                        </button>
                    </form>

                    <table>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Issue</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(reports) && reports.length > 0 ? (
                                reports.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.area_name}</td>
                                        <td>{r.issue_type}</td>
                                        <td>{r.description}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center" }}>
                                        No reports yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
                <Link to="/dashboard" className="btn">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Report;