import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";
import Loader from "../components/Loader";

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
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
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

        <div className="card">
          <h2>Add New Contact</h2>
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

            {error && <p style={{ color: "red", margin: "8px 0" }}>{error}</p>}
            {success && <p style={{ color: "green", margin: "8px 0", fontWeight: "bold" }}>{success}</p>}

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Adding..." : "Add Contact"}
            </button>
          </form>
        </div>

        {/* Trusted Contacts Table */}
        <div className="card">
          <h2 style={{ color: "#db2777" }}>⭐ Trusted Contacts</h2>
          {loading ? (
            <Loader message="Loading contacts..." />
          ) : (
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
                      <td><strong>{contact.contact_name}</strong></td>
                      <td>{contact.phone_number}</td>
                      <td>{contact.email || "—"}</td>
                      <td>{contact.relationship}</td>
                      <td>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            background: "linear-gradient(135deg, #ff8585, #ffb3b3)",
                            marginRight: "6px"
                          }}
                          onClick={() => toggleTrust(contact.id)}
                        >
                          Remove Trust
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            background: "#e11d48"
                          }}
                          onClick={() => deleteContact(contact.id, contact.contact_name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "16px", color: "#888", fontStyle: "italic" }}>
                      No trusted contacts yet. Add contacts and mark them as trusted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* All Contacts Table */}
        <div className="card">
          <h2>📋 All Contacts</h2>
          {loading ? (
            <Loader message="Loading contacts..." />
          ) : (
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
                      <td><strong>{contact.contact_name}</strong></td>
                      <td>{contact.phone_number}</td>
                      <td>{contact.email || "—"}</td>
                      <td>{contact.relationship}</td>
                      <td>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            marginRight: "6px"
                          }}
                          onClick={() => toggleTrust(contact.id)}
                        >
                          Mark Trusted ⭐
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            background: "linear-gradient(135deg, #ff8585, #ffb3b3)"
                          }}
                          onClick={() => deleteContact(contact.id, contact.contact_name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "16px", color: "#888", fontStyle: "italic" }}>
                      No other contacts added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/dashboard" className="btn">
          ← Back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default Contacts;