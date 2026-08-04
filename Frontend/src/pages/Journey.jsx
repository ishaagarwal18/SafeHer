import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle, FiClock, FiMapPin, FiNavigation, FiPhone, FiShield, FiUsers } from "react-icons/fi";
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
  const [loading, setLoading] = useState(false);
  const [routeEstimate, setRouteEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [checkInJourney, setCheckInJourney] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    dashboardApi.get("api/journey/").then((res) => setJourneys(Array.isArray(res.data) ? res.data : [])).catch(() => setJourneys([]));
    dashboardApi.get("api/contacts/").then((res) => {
      const trusted = (Array.isArray(res.data) ? res.data : []).filter((contact) => contact.is_trusted);
      setContacts(trusted);
      setSelectedContacts(trusted.map((contact) => contact.id));
    }).catch(() => setContacts([]));
  }, []);

  useEffect(() => {
    const loadActiveJourney = async () => {
      try {
        const response = await dashboardApi.get("api/journey/active/");
        if (response.data?.journey?.safety_check_pending) setCheckInJourney(response.data.journey);
      } catch {
        // A failed background check should never interrupt journey planning.
      }
    };
    loadActiveJourney();
    const interval = window.setInterval(loadActiveJourney, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const estimate = useMemo(() => {
    if (routeEstimate?.available) return routeEstimate.message;
    if (!form.source || !form.destination) return "Add locations to get a live Google Maps ETA";
    return routeEstimate?.message || "Get a live Google Maps ETA before you start";
  }, [form.destination, form.source, routeEstimate]);
  const change = (event) => { setUnsafeWarning(""); setRouteEstimate(null); setForm((current) => ({ ...current, [event.target.name]: event.target.value })); };
  const maps = (source, destination, transport) => {
    const mode = ["Bus", "Train"].includes(transport) ? "transit" : transport === "Walking" ? "walking" : "driving";
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`, "_blank", "noopener,noreferrer");
  };
  const locate = () => {
    if (!navigator.geolocation) return setError("Location services are not supported by this browser.");
    navigator.geolocation.getCurrentPosition(({ coords }) => setForm((current) => ({ ...current, source: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` })), () => setError("We could not access your location. Please enter it manually."));
  };
  const getLiveEstimate = async () => {
    if (!form.source || !form.destination) return setError("Add both locations before requesting an ETA.");
    setError(""); setEstimating(true);
    try {
      const response = await dashboardApi.post("api/journey/estimate/", form);
      setRouteEstimate(response.data);
    } catch {
      setRouteEstimate({ available: false, message: "Could not get the live Google Maps ETA. Please try again." });
    } finally { setEstimating(false); }
  };
  const toggleContact = (id) => setSelectedContacts((current) => current.includes(id) ? current.filter((contactId) => contactId !== id) : [...current, id]);
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const payload = { ...form, force: Boolean(unsafeWarning) };
      const response = await dashboardApi.post("api/journey/", payload);
      if (response.data?.unsafe_warning && !payload.force) { setUnsafeWarning(response.data.unsafe_warning); return; }
      setJourneys((current) => [response.data?.journey || response.data, ...current]);
      setRouteEstimate(response.data?.route_estimate || null);
      maps(form.source, form.destination, form.transport);
      setForm({ source: "", destination: "", transport: "Car" }); setUnsafeWarning("");
    } catch (requestError) { setError(requestError.response?.data?.error || "Could not start the journey. Please try again."); }
    finally { setLoading(false); }
  };
  const markCompleted = async (journeyId) => {
    setCheckingIn(true);
    try {
      const response = await dashboardApi.post(`api/journey/${journeyId}/complete/`);
      const updated = response.data.journey;
      setJourneys((current) => current.map((journey) => journey.id === updated.id ? updated : journey));
      setCheckInJourney(null);
    } catch { setError("Could not complete this journey. Please try again."); }
    finally { setCheckingIn(false); }
  };
  const answerSafetyCheck = async (responseValue) => {
    if (!checkInJourney) return;
    setCheckingIn(true);
    try {
      const response = await dashboardApi.post(`api/journey/${checkInJourney.id}/check-in/`, { response: responseValue });
      const updated = response.data.journey;
      setJourneys((current) => current.map((journey) => journey.id === updated.id ? updated : journey));
      setCheckInJourney(null);
    } catch { setError("We could not save your safety check-in. Please try again."); }
    finally { setCheckingIn(false); }
  };

  return <main className="journey-page"><div className="journey-shell">
    {checkInJourney && <div className="checkin-overlay" role="dialog" aria-modal="true" aria-labelledby="checkin-title"><section className="checkin-modal"><span className="checkin-icon"><FiShield /></span><p className="eyebrow">SAFEHER CHECK-IN</p><h2 id="checkin-title">Are you safe?</h2><p>Your expected arrival time for <strong>{checkInJourney.destination}</strong> has passed. Tell us what is happening.</p><div className="checkin-actions"><button className="checkin-safe" disabled={checkingIn} onClick={() => answerSafetyCheck("safe")}>I'm safe — end journey</button><button className="checkin-later" disabled={checkingIn} onClick={() => answerSafetyCheck("still_travelling")}>I'm still travelling</button></div></section></div>}
    <header className="journey-heading"><span className="journey-heading__icon"><FiNavigation /></span><div><p className="eyebrow">SAFEHER TRIP PLANNER</p><h1>Start a safe journey</h1><p>Share your journey plan with people you trust.</p></div></header>
    <section className="journey-layout">
      <form className="journey-form-card" onSubmit={submit}>
        <div className="section-title"><div><h2>Journey details</h2><p>Plan your route before you leave.</p></div><span className="secure-label"><FiShield /> Protected</span></div>
        {unsafeWarning && <div className="journey-warning"><FiAlertCircle /><div><strong>Safety notice</strong><p>{unsafeWarning}</p></div></div>}
        <div className="location-fields">
          <label><span><FiMapPin /> Starting point</span><div className="input-with-action"><input name="source" value={form.source} onChange={change} placeholder="Enter source" required /><button type="button" onClick={locate}>Use my location</button></div></label>
          <div className="route-line" aria-hidden="true" />
          <label><span><FiNavigation /> Destination</span><input name="destination" value={form.destination} onChange={change} placeholder="Where are you going?" required /></label>
        </div>
        <fieldset className="transport-picker"><legend>How are you travelling?</legend><div>{transportOptions.map(([value, icon]) => <button type="button" key={value} className={form.transport === value ? "transport-option selected" : "transport-option"} onClick={() => setForm((current) => ({ ...current, transport: value }))}><span>{icon}</span>{value}</button>)}</div></fieldset>
        <div className="trip-estimate"><FiClock /><span>{estimate}</span><button type="button" onClick={getLiveEstimate} disabled={estimating}>{estimating ? "Checking…" : "Get live ETA"}</button></div>
        {error && <p className="form-error">{error}</p>}
        <button className="journey-start-button" disabled={loading}>{loading ? "Starting journey…" : unsafeWarning ? "Proceed anyway" : "Start safe journey"}<FiNavigation /></button>
      </form>
      <aside className="safety-card">
        <div className="section-title"><div><h2>Safety check</h2><p>Your journey settings</p></div><FiShield className="safety-shield" /></div>
        <label className="switch-row"><span><FiNavigation /><span><strong>Live location sharing</strong><small>Share your route while travelling</small></span></span><input type="checkbox" checked={shareLocation} onChange={(event) => setShareLocation(event.target.checked)} /><i /></label>
        <div className="contact-section"><div className="contact-section__heading"><span><FiUsers /> Notify contacts</span><small>{selectedContacts.length} selected</small></div>{contacts.length ? contacts.map((contact) => <label className="contact-choice" key={contact.id}><input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={() => toggleContact(contact.id)} /><span className="contact-avatar">{contact.contact_name?.charAt(0).toUpperCase()}</span><span><strong>{contact.contact_name}</strong><small>{contact.relationship || "Trusted contact"}</small></span></label>) : <p className="empty-contacts"><FiPhone /> Add a trusted contact to notify them when you leave.</p>}</div>
        <p className="safety-note"><FiCheckCircle /> {shareLocation ? "Your selected contacts can follow your journey." : "Location sharing is currently off."}</p>
      </aside>
    </section>
    <section className="recent-journeys"><div className="section-title"><div><h2>Recent journeys</h2><p>Your latest safety plans at a glance.</p></div><Link to="/journey-history">View all history</Link></div><div className="journey-table-wrap"><table><thead><tr><th>Route</th><th>Transport</th><th>Started</th><th>Status</th><th /></tr></thead><tbody>{journeys.length ? journeys.slice(0, 5).map((journey, index) => <tr key={journey.id || index}><td><strong>{journey.source}</strong><span>{journey.destination}</span></td><td>{journey.transport_mode || journey.transport || "Car"}</td><td>{journey.start_time ? new Date(journey.start_time).toLocaleString() : "Just now"}</td><td><span className={`journey-status ${statusClass(journey.status)}`}>{journey.status || "Active"}</span></td><td><div className="journey-actions"><button type="button" className="map-button" onClick={() => maps(journey.source, journey.destination, journey.transport_mode || journey.transport)}><FiNavigation /> Map</button>{(journey.status || "Active") === "Active" && <button type="button" className="complete-button" disabled={checkingIn} onClick={() => markCompleted(journey.id)}><FiCheckCircle /> I'm safe</button>}</div></td></tr>) : <tr><td colSpan="5"><div className="empty-journeys"><FiNavigation /><strong>No journeys yet</strong><span>Start your first safe journey above.</span></div></td></tr>}</tbody></table></div></section>
    <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
  </div></main>;
}

export default Journey;
