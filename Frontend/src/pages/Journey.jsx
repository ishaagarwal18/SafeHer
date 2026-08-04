import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle, FiMapPin, FiNavigation, FiPhone, FiShield, FiUsers } from "react-icons/fi";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";

const transportOptions = [
  ["Car", "🚗"], ["Bus", "🚌"], ["Train", "🚆"], ["Walking", "🚶"],
];

const statusClass = (status = "Active") => {
  const value = status.toLowerCase();
  if (value.includes("complete") || value.includes("safe")) return "completed";
  if (value.includes("cancel") || value.includes("alert")) return "alert";
  return "active";
};

function Journey() {
  const [journeys, setJourneys] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ source: "", destination: "", transport: "Car" });
  const [shareLocation, setShareLocation] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [unsafeWarning, setUnsafeWarning] = useState("");
  const [error, setError] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkInJourney, setCheckInJourney] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    dashboardApi.get("api/journey/")
      .then((res) => setJourneys(Array.isArray(res.data) ? res.data : []))
      .catch(() => setJourneys([]));

    dashboardApi.get("api/contacts/")
      .then((res) => {
        const trusted = (Array.isArray(res.data) ? res.data : []).filter((contact) => contact.is_trusted);
        setContacts(trusted);
        setSelectedContacts(trusted.map((contact) => contact.id));
      })
      .catch(() => setContacts([]));
  }, []);

  useEffect(() => {
    const loadActiveJourney = async () => {
      try {
        const response = await dashboardApi.get("api/journey/active/");
        if (response.data?.journey?.safety_check_pending) setCheckInJourney(response.data.journey);
      } catch {
        // Silent error
      }
    };
    loadActiveJourney();
    const interval = window.setInterval(loadActiveJourney, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const change = (event) => {
    setUnsafeWarning("");
    setError("");
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const openMap = (source, destination, transport) => {
    const mode = ["Bus", "Train"].includes(transport) ? "transit" : transport === "Walking" ? "walking" : "driving";
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const locate = () => {
    if (!navigator.geolocation) return setError("Location services are not supported by this browser.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setForm((current) => ({ ...current, source: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` })),
      () => setError("We could not access your GPS location. Please enter it manually.")
    );
  };

  const toggleContact = (id) =>
    setSelectedContacts((current) => (current.includes(id) ? current.filter((contactId) => contactId !== id) : [...current, id]));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNoticeMsg("");
    setLoading(true);

    try {
      const payload = { ...form, force: Boolean(unsafeWarning) };
      const response = await dashboardApi.post("api/journey/", payload);

      if (response.data?.unsafe_warning && !payload.force) {
        setUnsafeWarning(response.data.unsafe_warning);
        return;
      }

      setJourneys((current) => [response.data?.journey || response.data, ...current]);
      setForm({ source: "", destination: "", transport: "Car" });
      setUnsafeWarning("");
      setNoticeMsg("🚀 Journey started! Trusted contacts have been notified.");
      setTimeout(() => setNoticeMsg(""), 5000);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not start the journey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send Safety Notice ("I'm Safe" button - keeps journey active)
  const sendSafeNotice = async (journeyId) => {
    setCheckingIn(true);
    try {
      const response = await dashboardApi.post(`api/journey/${journeyId}/check-in/`, { response: "safe_notice" });
      setNoticeMsg(response.data.message || "🛡️ Safety notice sent: Trusted contacts notified that you are safe!");
      setTimeout(() => setNoticeMsg(""), 5000);
    } catch {
      setError("Could not send safety check-in notice. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Complete Journey button handler
  const markCompleted = async (journeyId) => {
    setCheckingIn(true);
    try {
      const response = await dashboardApi.post(`api/journey/${journeyId}/complete/`);
      const updated = response.data.journey;
      setJourneys((current) => current.map((j) => (j.id === updated.id ? updated : j)));
      setCheckInJourney(null);
      setNoticeMsg("✅ Journey marked as Completed.");
      setTimeout(() => setNoticeMsg(""), 4000);
    } catch {
      setError("Could not complete this journey. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const answerSafetyCheck = async (responseValue) => {
    if (!checkInJourney) return;
    setCheckingIn(true);
    try {
      const response = await dashboardApi.post(`api/journey/${checkInJourney.id}/check-in/`, { response: responseValue });
      const updated = response.data.journey;
      setJourneys((current) => current.map((j) => (j.id === updated.id ? updated : j)));
      setCheckInJourney(null);
    } catch {
      setError("We could not save your safety check-in. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <main className="journey-page">
      <div className="journey-shell">
        {checkInJourney && (
          <div className="checkin-overlay" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
            <section className="checkin-modal">
              <span className="checkin-icon">
                <FiShield />
              </span>
              <p className="eyebrow">SAFEHER CHECK-IN</p>
              <h2 id="checkin-title">Are you safe?</h2>
              <p>
                Safety check for journey to <strong>{checkInJourney.destination}</strong>. Tell us what is happening.
              </p>
              <div className="checkin-actions">
                <button className="checkin-safe" disabled={checkingIn} onClick={() => answerSafetyCheck("safe")}>
                  I'm safe — end journey
                </button>
                <button className="checkin-later" disabled={checkingIn} onClick={() => answerSafetyCheck("still_travelling")}>
                  I'm still travelling
                </button>
              </div>
            </section>
          </div>
        )}

        <header className="journey-heading">
          <span className="journey-heading__icon">
            <FiNavigation />
          </span>
          <div>
            <p className="eyebrow">SAFEHER TRIP PLANNER</p>
            <h1>Start a safe journey</h1>
            <p>Share your journey plan with people you trust.</p>
          </div>
        </header>

        {noticeMsg && (
          <div
            style={{
              background: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {noticeMsg}
          </div>
        )}

        <section className="journey-layout">
          <form className="journey-form-card" onSubmit={submit}>
            <div className="section-title">
              <div>
                <h2>Journey details</h2>
                <p>Plan your route before you leave.</p>
              </div>
              <span className="secure-label">
                <FiShield /> Protected
              </span>
            </div>

            {unsafeWarning && (
              <div className="journey-warning">
                <FiAlertCircle />
                <div>
                  <strong>Safety notice</strong>
                  <p>{unsafeWarning}</p>
                </div>
              </div>
            )}

            <div className="location-fields">
              <label>
                <span>
                  <FiMapPin /> Starting point
                </span>
                <div className="input-with-action">
                  <input
                    name="source"
                    value={form.source}
                    onChange={change}
                    placeholder="Enter starting location manually"
                    required
                  />
                  <button type="button" onClick={locate} className="btn-locate-small" title="Use GPS location">
                    📍 GPS
                  </button>
                </div>
              </label>

              <div className="route-line" aria-hidden="true" />

              <label>
                <span>
                  <FiNavigation /> Destination
                </span>
                <input
                  name="destination"
                  value={form.destination}
                  onChange={change}
                  placeholder="Where are you going?"
                  required
                />
              </label>
            </div>

            <fieldset className="transport-picker">
              <legend>How are you travelling?</legend>
              <div>
                {transportOptions.map(([value, icon]) => (
                  <button
                    type="button"
                    key={value}
                    className={form.transport === value ? "transport-option selected" : "transport-option"}
                    onClick={() => setForm((current) => ({ ...current, transport: value }))}
                  >
                    <span>{icon}</span>
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && <p className="form-error">{error}</p>}

            <button className="journey-start-button" disabled={loading}>
              {loading ? "Starting journey…" : unsafeWarning ? "Proceed anyway" : "Start safe journey"}
              <FiNavigation />
            </button>
          </form>

          <aside className="safety-card">
            <div className="section-title">
              <div>
                <h2>Safety check</h2>
                <p>Your journey settings</p>
              </div>
              <FiShield className="safety-shield" />
            </div>

            <label className="switch-row">
              <span>
                <FiNavigation />
                <span>
                  <strong>Live location sharing</strong>
                  <small>Share your route while travelling</small>
                </span>
              </span>
              <input type="checkbox" checked={shareLocation} onChange={(event) => setShareLocation(event.target.checked)} />
              <i />
            </label>

            <div className="contact-section">
              <div className="contact-section__heading">
                <span>
                  <FiUsers /> Notify contacts
                </span>
                <small>{selectedContacts.length} selected</small>
              </div>
              {contacts.length ? (
                contacts.map((contact) => (
                  <label className="contact-choice" key={contact.id}>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                    />
                    <span className="contact-avatar">{contact.contact_name?.charAt(0).toUpperCase()}</span>
                    <span>
                      <strong>{contact.contact_name}</strong>
                      <small>{contact.relationship || "Trusted contact"}</small>
                    </span>
                  </label>
                ))
              ) : (
                <p className="empty-contacts">
                  <FiPhone /> Add a trusted contact to notify them when you leave.
                </p>
              )}
            </div>

            <p className="safety-note">
              <FiCheckCircle />{" "}
              {shareLocation ? "Your selected contacts can follow your journey." : "Location sharing is currently off."}
            </p>
          </aside>
        </section>

        {/* Display only the last 5 journeys */}
        <section className="recent-journeys">
          <div className="section-title">
            <div>
              <h2>Recent journeys</h2>
              <p>Your latest 5 safety plans at a glance.</p>
            </div>
            <Link to="/journey-history">View all history</Link>
          </div>

          <div className="journey-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Transport</th>
                  <th>Started</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {journeys.length ? (
                  journeys.slice(0, 5).map((journey, index) => {
                    const isActive = (journey.status || "Active") === "Active";
                    return (
                      <tr key={journey.id || index}>
                        <td>
                          <strong>{journey.source}</strong>
                          <span>{journey.destination}</span>
                        </td>
                        <td>{journey.transport_mode || journey.transport || "Car"}</td>
                        <td>{journey.start_time ? new Date(journey.start_time).toLocaleString() : "Just now"}</td>
                        <td>
                          <span className={`journey-status ${statusClass(journey.status)}`}>{journey.status || "Active"}</span>
                        </td>
                        <td>
                          <div className="journey-actions">
                            <button
                              type="button"
                              className="map-button"
                              onClick={() => openMap(journey.source, journey.destination, journey.transport_mode || journey.transport)}
                            >
                              <FiNavigation /> Map
                            </button>
                            {isActive && (
                              <>
                                <button
                                  type="button"
                                  className="complete-button"
                                  disabled={checkingIn}
                                  onClick={() => sendSafeNotice(journey.id)}
                                  title="Send safety check-in notice to trusted contacts"
                                >
                                  <FiCheckCircle /> I'm safe
                                </button>
                                <button
                                  type="button"
                                  className="complete-button"
                                  style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}
                                  disabled={checkingIn}
                                  onClick={() => markCompleted(journey.id)}
                                  title="End this journey"
                                >
                                  End
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-journeys">
                        <FiNavigation />
                        <strong>No journeys yet</strong>
                        <span>Start your first safe journey above.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Link to="/dashboard" className="back-link">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}

export default Journey;
