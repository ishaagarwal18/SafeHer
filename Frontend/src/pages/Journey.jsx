import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle, FiMapPin, FiNavigation, FiPhone, FiShield, FiUsers } from "react-icons/fi";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";

const transportOptions = [
  ["Car", "🚗"], ["Bus", "🚌"], ["Train", "🚆"], ["Walking", "🚶"],
];

const statusClass = (status = "Active") => {
  const value = status.toLowerCase();
  if (value.includes("complete")) return "completed";
  if (value.includes("alert") || value.includes("unsafe")) return "alert";
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

  // Active Journey & Safety Check Modal State
  const [activeJourney, setActiveJourney] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const checkInTimerRef = useRef(null);
  const modalCountdownRef = useRef(null);

  useEffect(() => {
    fetchJourneys();
    dashboardApi
      .get("api/contacts/")
      .then((res) => {
        const trusted = (Array.isArray(res.data) ? res.data : []).filter((contact) => contact.is_trusted);
        setContacts(trusted);
        setSelectedContacts(trusted.map((contact) => contact.id));
      })
      .catch(() => setContacts([]));
  }, []);

  const fetchJourneys = () => {
    dashboardApi
      .get("api/journey/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setJourneys(list);
        const active = list.find((j) => (j.status || "Active") === "Active");
        setActiveJourney(active || null);
      })
      .catch(() => setJourneys([]));
  };

  // Periodic 10-Minute Safety Check Trigger
  useEffect(() => {
    if (activeJourney) {
      // Trigger safety prompt modal every 10 minutes (600,000 ms)
      checkInTimerRef.current = setInterval(() => {
        setShowCheckInModal(true);
      }, 600000);
    } else {
      if (checkInTimerRef.current) clearInterval(checkInTimerRef.current);
      setShowCheckInModal(false);
    }

    return () => {
      if (checkInTimerRef.current) clearInterval(checkInTimerRef.current);
    };
  }, [activeJourney]);

  // Modal 60-Second Auto-Dismiss / Missed Check-in Count Timer
  useEffect(() => {
    if (showCheckInModal) {
      setCountdown(60);
      modalCountdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(modalCountdownRef.current);
            handleMissedCheckIn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (modalCountdownRef.current) clearInterval(modalCountdownRef.current);
    }

    return () => {
      if (modalCountdownRef.current) clearInterval(modalCountdownRef.current);
    };
  }, [showCheckInModal]);

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

  // Submit — Start Safe Journey
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

      const created = response.data?.journey || response.data;
      const duration = response.data?.estimated_duration_minutes || created.expected_duration_minutes || 30;

      fetchJourneys();
      setForm({ source: "", destination: "", transport: "Car" });
      setUnsafeWarning("");

      setNoticeMsg(
        `🚀 Safe Journey started! Estimated duration: ~${duration} mins. Periodic safety check scheduled every 10 mins.`
      );

      // Trigger first safety check after 10 mins (or allow quick manual test)
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not start the journey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle User Response: "I'm Safe"
  const handleImSafe = async () => {
    if (!activeJourney) return;
    setCheckingIn(true);
    try {
      const res = await dashboardApi.post(`api/journey/${activeJourney.id}/check-in/`, { response: "safe" });
      setShowCheckInModal(false);
      setNoticeMsg(res.data?.message || "✅ Check-in recorded: You are safe! Next check-in scheduled in 10 minutes.");
      setTimeout(() => setNoticeMsg(""), 5000);
      fetchJourneys();
    } catch {
      setError("Failed to record safety check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle User Response: "Not Safe"
  const handleNotSafe = async () => {
    if (!activeJourney) return;
    setCheckingIn(true);
    try {
      const res = await dashboardApi.post(`api/journey/${activeJourney.id}/check-in/`, { response: "not_safe" });
      setShowCheckInModal(false);
      setNoticeMsg("🚨 URGENT: Emergency alert email sent to trusted contacts that you are NOT SAFE!");
      fetchJourneys();
    } catch {
      setError("Failed to send Not Safe alert.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle Missed Check-in (Ignored prompt)
  const handleMissedCheckIn = async () => {
    if (!activeJourney) return;
    try {
      const res = await dashboardApi.post(`api/journey/${activeJourney.id}/check-in/`, { response: "missed" });
      setShowCheckInModal(false);
      if (res.data?.escalated) {
        setNoticeMsg("⚠️ 2 safety check-ins missed! Escalation email automatically sent to trusted contacts.");
      } else {
        setNoticeMsg("⚠️ Safety check-in prompt missed (1/2). Next check-in in 10 minutes.");
      }
      fetchJourneys();
    } catch {
      setShowCheckInModal(false);
    }
  };

  // Mark Journey Complete
  const markCompleted = async (journeyId) => {
    setCheckingIn(true);
    try {
      const response = await dashboardApi.post(`api/journey/${journeyId}/complete/`);
      setNoticeMsg("✅ Journey marked as Completed.");
      setTimeout(() => setNoticeMsg(""), 4000);
      fetchJourneys();
    } catch {
      setError("Could not complete this journey. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <main className="journey-page">
      <div className="journey-shell">
        {/* Periodic Safety Check Modal: Are you safe? */}
        {showCheckInModal && activeJourney && (
          <div className="checkin-overlay" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
            <section className="checkin-modal" style={{ maxWidth: "450px", borderTop: "6px solid #ff4f81" }}>
              <span className="checkin-icon" style={{ background: "#ffe7ef", color: "#ff4f81" }}>
                <FiShield />
              </span>
              <p className="eyebrow" style={{ color: "#ff4f81", marginTop: "10px" }}>
                SAFEHER 10-MIN SAFETY CHECK
              </p>
              <h2 id="checkin-title" style={{ fontSize: "28px", margin: "6px 0" }}>
                Are you safe?
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "6px 0 16px" }}>
                Journey: <strong>{activeJourney.source}</strong> → <strong>{activeJourney.destination}</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Auto-dismiss in {countdown}s (Missed count will increase)
                </span>
              </p>

              <div className="checkin-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button
                  type="button"
                  className="checkin-safe"
                  disabled={checkingIn}
                  onClick={handleImSafe}
                  style={{
                    background: "#10b981",
                    color: "white",
                    padding: "14px",
                    borderRadius: "12px",
                    fontWeight: "800",
                    fontSize: "15px",
                    border: "0",
                    cursor: "pointer",
                  }}
                >
                  ✅ I'm Safe
                </button>
                <button
                  type="button"
                  disabled={checkingIn}
                  onClick={handleNotSafe}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    padding: "14px",
                    borderRadius: "12px",
                    fontWeight: "800",
                    fontSize: "15px",
                    border: "0",
                    cursor: "pointer",
                  }}
                >
                  🚨 Not Safe
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

        {/* Active Journey Estimate & Safety Banner */}
        {activeJourney && (
          <div
            style={{
              background: "linear-gradient(135deg, #fff0f5 0%, #fff 100%)",
              border: "1.5px solid #ff9ab7",
              borderRadius: "18px",
              padding: "18px 24px",
              marginBottom: "24px",
              boxShadow: "0 10px 25px rgba(255,79,129,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <span
                style={{
                  background: "#ff4f81",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "4px 10px",
                  borderRadius: "99px",
                  letterSpacing: "0.5px",
                }}
              >
                ACTIVE JOURNEY MONITORING
              </span>
              <h3 style={{ margin: "8px 0 4px", fontSize: "18px", color: "#1e293b" }}>
                📍 {activeJourney.source} → {activeJourney.destination}
              </h3>
              <p style={{ margin: "0", fontSize: "13px", color: "#64748b" }}>
                ⏱ Estimated Time: <strong>~{activeJourney.expected_duration_minutes || 30} mins</strong> ({activeJourney.transport_mode || "Car"}) • Safety check every 10 mins
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn-locate-small"
                onClick={() => setShowCheckInModal(true)}
                style={{ position: "static", padding: "10px 16px", fontSize: "13px", background: "#ff4f81", color: "white" }}
              >
                🛡️ Test Safety Check
              </button>
              <button
                type="button"
                className="complete-button"
                style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd", padding: "10px 16px", fontSize: "13px" }}
                onClick={() => markCompleted(activeJourney.id)}
              >
                End Journey
              </button>
            </div>
          </div>
        )}

        {noticeMsg && (
          <div
            style={{
              background: noticeMsg.includes("🚨") || noticeMsg.includes("⚠️") ? "#fef2f2" : "#ecfdf5",
              color: noticeMsg.includes("🚨") || noticeMsg.includes("⚠️") ? "#991b1b" : "#047857",
              border: `1px solid ${noticeMsg.includes("🚨") || noticeMsg.includes("⚠️") ? "#fca5a5" : "#a7f3d0"}`,
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
