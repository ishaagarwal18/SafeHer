import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import api from "../services/api";

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [form, setForm] = useState({ name: "", phone: "", relationship: "" });

    const fetchContacts = async () => {
        try {
            const res = await api.get("contacts/");
            setContacts(Array.isArray(res.data) ? res.data : (res.data?.results || []));
        } catch (err) {
            console.log(err);
            setContacts([]);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const [msg, setMsg] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");
        try {
            const res = await api.post("contacts/", form);
            setForm({ name: "", phone: "", relationship: "" });
            setMsg(res.data?.message || "✅ Contact added successfully!");
            fetchContacts();
        } catch (err) {
            console.log(err);
            setMsg(err.response?.data?.error || "Failed to add contact.");
        }
    };

    const handleAddTrusted = async (e, contactId) => {
        e.preventDefault();
        setMsg("");
        try {
            const res = await api.post("add-trusted-contact/", { contact_id: contactId });
            setMsg(res.data?.message || "⭐ Added to Trusted Contacts!");
            fetchContacts();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="feature-page">
            <div className="container">
                <h1 className="page-title">
                    📞 Trusted Contacts
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

                {/* Add Contact Form */}
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Contact Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            pattern="[6789][0-9]{9}"
                            maxLength="10"
                            inputMode="numeric"
                            value={form.phone}
                            onChange={handleChange}
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            }}
                            title="Phone number must start with 6, 7, 8, or 9 and contain exactly 10 digits."
                            required
                        />

                        <input
                            type="text"
                            name="relationship"
                            placeholder="Relationship"
                            value={form.relationship}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit" className="btn">
                            Add Contact
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h2>Saved Contacts</h2>

                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Relationship</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(contacts) && contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td>{contact.contact_name}</td>
                                    <td>{contact.phone_number}</td>
                                    <td>{contact.relationship}</td>
                                    <td>
                                        <form onSubmit={(e) => handleAddTrusted(e, contact.id)}>
                                            <input type="hidden" name="contact_id" value={contact.id} />
                                            <button type="submit" className="btn">
                                                Add to Trusted Contacts
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
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

export default Contacts;