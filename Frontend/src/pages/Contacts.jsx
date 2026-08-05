import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiUserPlus, FiStar, FiUsers, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";
import "../styles/features.css";

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
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon">
              <FiPhone />
            </span>
            <div>
              <p className="eyebrow">SAFEHER SAFETY NETWORK</p>
              <h1>Trusted Emergency Contacts</h1>
              <p>Manage contacts who receive your instant SOS alerts & journey safety check-ins.</p>
            </div>
          </header>

          {/* Add Contact Form Card */}
          <div className="journey-form-card" style={{ marginBottom: "24px" }}>
            <div className="section-title">
              <div>
                <h2>Add New Contact</h2>
                <p>Add a friend, family member, or trusted person to your safety network.</p>
              </div>
              <span className="secure-label">
                <FiUserPlus /> Quick Add
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #ffb3b3",
                  color: "#c0392b",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  margin: "16px 0",
                  fontSize: "14px",
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
                  margin: "16px 0",
                  fontSize: "14px",
                }}
              >
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address (for SOS & Check-in alerts)"
                  value={form.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="relationship"
                  placeholder="Relationship (e.g. Sister, Friend, Partner)"
                  value={form.relationship}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="journey-start-button" style={{ marginTop: "12px" }} disabled={submitting}>
                {submitting ? "Adding Contact..." : "Save Emergency Contact"}
              </button>
            </form>
          </div>

          {/* Trusted Contacts Card */}
          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title">
              <div>
                <h2>⭐ Trusted Contacts ({trustedContacts.length})</h2>
                <p>These contacts automatically receive emergency SOS alerts and journey notifications.</p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "30px 0" }}>
                <Loader message="Loading contacts..." />
              </div>
            ) : (
              <div className="journey-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Relationship</th>
                      <th>Status & Action</th>
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
                              className="map-button"
                              style={{ color: "#d97706", borderColor: "#fef3c7", background: "#fffbeb" }}
                              onClick={() => toggleTrust(contact.id)}
                            >
                              Remove ⭐
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <div className="empty-journeys">
                            <FiStar />
                            <strong>No trusted contacts marked</strong>
                            <span>Mark contacts as trusted below to auto-notify them in emergency situations.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All Contacts Card */}
          <div className="history-card" style={{ marginBottom: "24px" }}>
            <div className="section-title">
              <div>
                <h2>📋 All Contacts ({regularContacts.length})</h2>
                <p>Your full phonebook list in SafeHer.</p>
              </div>
            </div>

            <div className="journey-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Relationship</th>
                    <th>Actions</th>
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
                          <div className="journey-actions">
                            <button
                              type="button"
                              className="complete-button"
                              onClick={() => toggleTrust(contact.id)}
                            >
                              Mark Trusted ⭐
                            </button>
                            <button
                              type="button"
                              className="map-button"
                              style={{ color: "#dc2626", borderColor: "#fecaca" }}
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
                      <td colSpan="5">
                        <div className="empty-journeys">
                          <FiUsers />
                          <strong>No other contacts added</strong>
                          <span>Add emergency contacts using the form above.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <Link to="/dashboard" className="back-to-dashboard-btn">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Contacts;