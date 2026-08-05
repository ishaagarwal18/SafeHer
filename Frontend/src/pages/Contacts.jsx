import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", relationship: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchContacts = () => {
    dashboardApi
      .get("api/contacts/")
      .then((res) => {
        setContacts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setContacts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await dashboardApi.post("api/contacts/", form);
      setContacts((prev) => [res.data, ...prev]);
      setForm({ name: "", phone: "", email: "", relationship: "" });
      setSuccess("Contact added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add contact.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTrust = async (contactId) => {
    try {
      const res = await dashboardApi.post(`api/contacts/${contactId}/trust/`);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, is_trusted: res.data.is_trusted } : c))
      );
    } catch (_) {
      alert("Could not update contact status.");
    }
  };

  const deleteContact = async (contactId, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await dashboardApi.post(`api/contacts/${contactId}/delete/`);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (_) {
      alert("Could not delete contact.");
    }
  };

  const trustedContacts = contacts.filter((c) => c.is_trusted);
  const regularContacts = contacts.filter((c) => !c.is_trusted);

  return (
    <>
      <div className="container">
        <h1 className="page-title">📞 Emergency Contacts</h1>

        {/* Add Contact Form */}
        <div className="card">
          <h2>Add New Contact</h2>

          {error && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid #ffb3b3",
                color: "#c0392b",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "16px",
                fontSize: "14px"
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#f0fff4",
                border: "1px solid #9ae6b4",
                color: "#276749",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "16px",
                fontSize: "14px"
              }}
            >
              {success}
            </div>
          )}

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
              placeholder="Phone Number (10 digits)"
              maxLength="10"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                setForm({ ...form, phone: val });
              }}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address (for SOS alerts)"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="relationship"
              placeholder="Relationship (e.g. Mom, Friend)"
              value={form.relationship}
              onChange={handleChange}
              required
            />

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Adding..." : "Add Contact"}
            </button>
          </form>
        </div>

        {/* Trusted Contacts Table */}
        <div className="card">
          <p style={{ fontSize: "18px", color: "#ff4f81", fontWeight: "600", marginBottom: "14px" }}>
            ⭐ Trusted Contacts
          </p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Relationship</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trustedContacts.length > 0 ? (
                trustedContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.contact_name}</td>
                    <td>{contact.phone_number}</td>
                    <td>{contact.email || "—"}</td>
                    <td>{contact.relationship}</td>
                    <td>
                      <button
                        type="button"
                        className="contact-btn remove-trust"
                        onClick={() => toggleTrust(contact.id)}
                      >
                        ✕ Remove Trust
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="5" style={{ textAlign: "center", color: "#aaa", fontStyle: "italic", padding: "16px" }}>
                    No trusted contacts yet. Add contacts below and mark them as trusted.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* All Contacts Table */}
        <div className="card">
          <p style={{ fontSize: "18px", color: "#ff4f81", fontWeight: "600", marginBottom: "14px" }}>
            📋 All Contacts
          </p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Relationship</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {regularContacts.length > 0 ? (
                regularContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.contact_name}</td>
                    <td>{contact.phone_number}</td>
                    <td>{contact.email || "—"}</td>
                    <td>{contact.relationship}</td>
                    <td>
                      <div className="contact-actions">
                        <button
                          type="button"
                          className="contact-btn mark-trust"
                          onClick={() => toggleTrust(contact.id)}
                        >
                          ⭐ Mark Trusted
                        </button>
                        <button
                          type="button"
                          className="contact-btn delete"
                          onClick={() => deleteContact(contact.id, contact.contact_name)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="5" style={{ textAlign: "center", color: "#aaa", fontStyle: "italic", padding: "16px" }}>
                    No contacts added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="back-dashboard-btn">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default Contacts;