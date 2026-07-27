import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";
import Loader from "../components/Loader";

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });
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
      setForm({ name: "", phone: "", relationship: "" });
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

  return (
    <>
      <div className="container">
        <h1 className="page-title">📞 Trusted Emergency Contacts</h1>

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
              type="text"
              name="relationship"
              placeholder="Relationship (e.g. Mother, Friend)"
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

        <div className="card">
          <h2>Saved Contacts List</h2>

          {loading ? (
            <Loader message="Loading contacts..." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Relationship</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td><strong>{contact.contact_name}</strong></td>
                      <td>{contact.phone_number}</td>
                      <td>{contact.relationship}</td>
                      <td>
                        <span className={`status-badge ${contact.is_trusted ? "completed" : "pending"}`}>
                          {contact.is_trusted ? "Trusted" : "Standard"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            background: contact.is_trusted ? "#64748b" : "#db2777"
                          }}
                          onClick={() => toggleTrust(contact.id)}
                        >
                          {contact.is_trusted ? "Untrust" : "Make Trusted"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No Contacts Found. Add your first trusted contact above.
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