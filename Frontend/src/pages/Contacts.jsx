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
      setSuccess("✅ Contact added successfully!");
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

  return (
    <div className="container">
      <h1 className="page-title">📞 Trusted Emergency Contacts</h1>

      <div className="card">
        <h2>Add New Contact</h2>

        {error && (
          <div className="alert-box alert-danger">
            <p style={{ fontWeight: "700", margin: 0 }}>{error}</p>
          </div>
        )}
        {success && (
          <div className="alert-box alert-success">
            <p style={{ fontWeight: "700", margin: 0 }}>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Contact Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                maxLength="10"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                  setForm({ ...form, phone: val });
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com (for SOS alerts)"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>Relationship</label>
              <input
                type="text"
                name="relationship"
                placeholder="e.g. Mother, Sister, Friend"
                value={form.relationship}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={submitting} style={{ marginTop: "10px" }}>
            {submitting ? "Adding..." : "➕ Add Emergency Contact"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Saved Emergency Contacts List</h2>

        {loading ? (
          <Loader message="Loading trusted contacts..." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Relationship</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <strong>{contact.contact_name}</strong>
                    </td>
                    <td>📞 {contact.phone_number}</td>
                    <td>{contact.email || "—"}</td>
                    <td>{contact.relationship}</td>
                    <td>
                      <span className={`status-badge ${contact.is_trusted ? "completed" : "pending"}`}>
                        {contact.is_trusted ? "🛡️ Trusted" : "Standard"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className={contact.is_trusted ? "btn-sm" : "btn-sm btn-success"}
                          onClick={() => toggleTrust(contact.id)}
                        >
                          {contact.is_trusted ? "Untrust" : "Make Trusted ⭐"}
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-danger"
                          onClick={() => deleteContact(contact.id, contact.contact_name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    No Contacts Found. Add your first trusted contact above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Contacts;