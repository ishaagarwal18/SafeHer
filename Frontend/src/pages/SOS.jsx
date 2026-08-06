import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiCamera, FiMic, FiVideo, FiShield, FiClock, FiMapPin } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { dashboardApi } from "../services/api";
import "../styles/journey.css";
import "../styles/features.css";

function SOS() {
  // Session & Countdown State
  const [activeSession, setActiveSession] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // GPS Location & Tracking State
  const [coords, setCoords] = useState({ latitude: "", longitude: "", accuracy: null });
  const [locationName, setLocationName] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Media Capture State
  const [photoStream, setPhotoStream] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [audioRecording, setAudioRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioUploading, setAudioUploading] = useState(false);

  const [videoRecording, setVideoRecording] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);

  // Refs for Timers & Media
  const countdownIntervalRef = useRef(null);
  const trackingIntervalRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const audioTimerRef = useRef(null);
  const videoTimerRef = useRef(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Reverse Geocoding Helper
  const fetchAddress = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`
      );
      const data = await res.json();
      const a = data.address || {};
      const parts = [
        a.house_number ? `${a.house_number} ${a.road || ""}` : a.road || a.pedestrian || a.footway || "",
        a.neighbourhood || a.suburb || a.quarter || a.residential || "",
        a.village || a.town || a.city_district || a.county || a.city || "",
        a.state || "",
        a.postcode || "",
      ]
        .map((p) => p.trim())
        .filter(Boolean);
      return parts.join(", ") || data.display_name || `${lat}, ${lon}`;
    } catch (_) {
      return `${lat}, ${lon}`;
    }
  };

  // Get initial location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ latitude: lat, longitude: lon, accuracy: position.coords.accuracy });
          const addr = await fetchAddress(lat, lon);
          setLocationName(addr);
        },
        () => {
          showToast("GPS Location unavailable — please enable Location permissions.", "error");
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, []);

  // Handle Countdown Timer
  useEffect(() => {
    if (showCountdown) {
      setCountdown(5);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            setShowCountdown(false);
            triggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showCountdown]);

  // Handle Elapsed Emergency Duration Timer & 15-Second Continuous Tracking
  useEffect(() => {
    if (activeSession) {
      setElapsedSeconds(0);
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      trackingIntervalRef.current = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const addr = await fetchAddress(lat, lon);

            setCoords({ latitude: lat, longitude: lon, accuracy: position.coords.accuracy });
            setLocationName(addr);

            dashboardApi
              .post("api/sos/location/", {
                session_id: activeSession.id,
                latitude: lat,
                longitude: lon,
                accuracy: position.coords.accuracy,
                location_name: addr,
              })
              .catch(() => {});
          });
        }
      }, 15000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    }

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [activeSession]);

  const handleSOSClick = () => {
    setShowCountdown(true);
  };


  const cancelCountdown = () => {
    setShowCountdown(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    showToast("SOS Alert Cancelled.", "info");
  };

  const triggerSOS = async () => {
    setShowCountdown(false);
    setLoading(true);
    try {
      const res = await dashboardApi.post("api/sos/start/", {
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: locationName || "Emergency GPS Location Alert",
        accuracy: coords.accuracy,
      });

      setActiveSession(res.data.session);
      showToast(res.data.message || "🚨 EMERGENCY SOS ACTIVATED!", "error");
    } catch (_) {
      showToast("❌ Failed to send SOS alert. Please check your network.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImSafe = async () => {
    if (!activeSession) return;
    setLoading(true);

    if (audioRecording) stopAudioRecording();
    if (videoRecording) stopVideoRecording();

    try {
      const res = await dashboardApi.post("api/sos/end/", { session_id: activeSession.id });
      showToast(res.data?.message || "SOS session ended. Stay safe! 💖", "success");
      setActiveSession(null);
    } catch (_) {
      showToast("Failed to mark session as Safe. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPhotoStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (_) {
      showToast("Camera access denied or unavailable.", "error");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob || !activeSession) return;
      const file = new File([blob], `sos_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      setPhotoPreview(URL.createObjectURL(blob));

      setPhotoUploading(true);
      const formData = new FormData();
      formData.append("session_id", activeSession.id);
      formData.append("photo", file);

      try {
        await dashboardApi.post("api/sos/upload-photo/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("📷 Photo captured & sent to trusted contacts immediately!", "success");
      } catch (_) {
        showToast("Failed to upload photo.", "error");
      } finally {
        setPhotoUploading(false);
      }
    }, "image/jpeg");
  };

  const getSupportedAudioMime = () => {
    const candidates = [
      { mime: "audio/mp4", ext: "mp4" },
      { mime: "audio/aac", ext: "aac" },
      { mime: "audio/webm;codecs=opus", ext: "webm" },
      { mime: "audio/webm", ext: "webm" },
      { mime: "audio/ogg;codecs=opus", ext: "ogg" },
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mime)) {
        return c;
      }
    }
    return { mime: "audio/webm", ext: "webm" };
  };

  const getSupportedVideoMime = () => {
    const candidates = [
      { mime: "video/mp4", ext: "mp4" },
      { mime: "video/webm;codecs=h264,opus", ext: "mp4" },
      { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
      { mime: "video/webm", ext: "webm" },
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c.mime)) {
        return c;
      }
    }
    return { mime: "video/webm", ext: "webm" };
  };

  const startAudioRecording = async () => {
    if (!activeSession) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTypeInfo = getSupportedAudioMime();
      const recorderOptions = {
        mimeType: audioTypeInfo.mime,
        audioBitsPerSecond: 32000, // 32 kbps voice compression for small file size and high clarity
      };

      audioRecorderRef.current = new MediaRecorder(stream, recorderOptions);
      audioChunksRef.current = [];

      audioRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      audioRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: audioTypeInfo.mime });
        const file = new File([audioBlob], `sos_audio_${Date.now()}.${audioTypeInfo.ext}`, { type: audioTypeInfo.mime });

        setAudioUploading(true);
        const formData = new FormData();
        formData.append("session_id", activeSession.id);
        formData.append("audio", file);
        formData.append("duration", audioDuration);

        try {
          await dashboardApi.post("api/sos/upload-audio/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          showToast("🎙️ Compressed audio recording sent to trusted contacts!", "success");
        } catch (_) {
          showToast("Failed to upload audio.", "error");
        } finally {
          setAudioUploading(false);
        }
      };

      audioRecorderRef.current.start(500);
      setAudioRecording(true);
      setAudioDuration(0);

      audioTimerRef.current = setInterval(() => {
        setAudioDuration((prev) => prev + 1);
      }, 1000);
    } catch (_) {
      showToast("Microphone permission denied or unavailable.", "error");
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && audioRecording) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setAudioRecording(false);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }
  };

  const startVideoRecording = async () => {
    if (!activeSession) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640, max: 854 }, height: { ideal: 480, max: 480 }, frameRate: { ideal: 15, max: 20 } },
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const videoTypeInfo = getSupportedVideoMime();
      const recorderOptions = {
        mimeType: videoTypeInfo.mime,
        videoBitsPerSecond: 350000, // 350 kbps video compression for small file size and high mobile/email compatibility
        audioBitsPerSecond: 32000,
      };

      videoRecorderRef.current = new MediaRecorder(stream, recorderOptions);
      videoChunksRef.current = [];

      videoRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      videoRecorderRef.current.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: videoTypeInfo.mime });
        const file = new File([videoBlob], `sos_video_${Date.now()}.${videoTypeInfo.ext}`, { type: videoTypeInfo.mime });

        setVideoUploading(true);
        const formData = new FormData();
        formData.append("session_id", activeSession.id);
        formData.append("video", file);
        formData.append("duration", videoDuration);

        try {
          await dashboardApi.post("api/sos/upload-video/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          showToast("📹 Compressed video recording sent to trusted contacts!", "success");
        } catch (_) {
          showToast("Failed to upload video.", "error");
        } finally {
          setVideoUploading(false);
        }
      };

      videoRecorderRef.current.start(500);
      setVideoRecording(true);
      setVideoDuration(0);

      videoTimerRef.current = setInterval(() => {
        setVideoDuration((prev) => prev + 1);
      }, 1000);
    } catch (_) {
      showToast("Camera/Microphone permission denied for video.", "error");
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && videoRecording) {
      videoRecorderRef.current.stop();
      videoRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setVideoRecording(false);
      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    }
  };


  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? (hrs < 10 ? "0" + hrs : hrs) + ":" : ""}${mins < 10 ? "0" + mins : mins}:${
      secs < 10 ? "0" + secs : secs
    }`;
  };

  return (
    <DashboardLayout>
      <div className="journey-page" style={{ margin: 0, padding: 0, background: "transparent" }}>
        <div className="journey-shell">
          <header className="journey-heading">
            <span className="journey-heading__icon" style={{ background: "linear-gradient(135deg, #ff0044, #ff4f81)" }}>
              <FiAlertTriangle />
            </span>
            <div>
              <p className="eyebrow" style={{ color: "#ff0044" }}>SAFEHER EMERGENCY CONSOLE</p>
              <h1>Emergency SOS Alert System</h1>
              <p>Trigger instant emergency alerts, continuous GPS tracking, and media evidence recording.</p>
            </div>
          </header>

          {/* 1. Smart SOS Button Section */}
          {!activeSession ? (
            <div className="history-card" style={{ textAlign: "center", padding: "40px 20px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px" }}>Need Immediate Emergency Help?</h2>
              <p style={{ color: "#64748b", margin: "8px 0 30px" }}>
                Press the SOS button below. Trusted contacts will be instantly notified with your live GPS location.
              </p>
              <div className="sos-button-wrapper">
                <div className="sos-ripple-ring ring-1" />
                <div className="sos-ripple-ring ring-2" />
                <div className="sos-ripple-ring ring-3" />
                <button type="button" className="sos-smart-btn" onClick={handleSOSClick} disabled={loading}>
                  <span>🚨</span>
                  <span>{loading ? "SENDING..." : "SOS"}</span>
                </button>
              </div>
              <div style={{ marginTop: "20px", fontSize: "14px", color: "#64748b" }}>
                📍 <strong>Current Location:</strong> {locationName || "Fetching GPS coordinates..."}
              </div>
            </div>
          ) : (
            <div className="history-card active-emergency-card" style={{ marginBottom: "24px" }}>
              <div className="emergency-status-badge">
                <span className="live-dot" />
                <span>SOS ACTIVATED — LIVE EMERGENCY IN PROGRESS</span>
              </div>
              <h2>🚨 Emergency Alert Broadcast Active</h2>
              <p style={{ color: "#475569" }}>
                Continuous 15-second live GPS tracking is active. Authorities & trusted contacts are monitored.
              </p>
              <div className="emergency-metrics-grid">
                <div className="metric-box">
                  <label>Emergency Elapsed Duration</label>
                  <div className="val">{formatTimer(elapsedSeconds)}</div>
                </div>
                <div className="metric-box">
                  <label>Current Time</label>
                  <div className="val" style={{ fontSize: "16px", color: "#1e293b" }}>
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="metric-box">
                  <label>GPS Coordinates</label>
                  <div className="val" style={{ fontSize: "14px", color: "#0284c7" }}>
                    {coords.latitude ? `${Number(coords.latitude).toFixed(4)}, ${Number(coords.longitude).toFixed(4)}` : "Tracking..."}
                  </div>
                </div>
              </div>
              <div style={{ background: "white", padding: "14px 18px", borderRadius: "14px", margin: "10px 0" }}>
                <strong>📍 Last Saved Address:</strong> {locationName}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
                <button type="button" className="banner-action-btn" onClick={triggerSOS} disabled={loading} style={{ background: "#e53935", color: "white", flex: 1, justifyContent: "center" }}>
                  <span>🚨 Send Urgent SOS Email Alert</span>
                </button>
                <button type="button" className="btn-im-safe" onClick={handleImSafe} disabled={loading} style={{ flex: 1 }}>
                  <span>🛡️</span>
                  <span>{loading ? "SAVING..." : "I'M SAFE NOW (End Emergency)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Media Recording Tools */}
          {activeSession && (
            <div className="history-card" style={{ marginBottom: "24px" }}>
              <div className="section-title">
                <div>
                  <h2>📷 Media Evidence Recording Tools</h2>
                  <p>Capture photos, audio, or video evidence stored securely with this SOS session.</p>
                </div>
              </div>

              <div className="media-tools-grid">
                <div className="media-tool-card">
                  <h3>📷 Camera Photo Capture</h3>
                  <div className="media-preview-container">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Captured preview" />
                    ) : photoStream ? (
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>Camera inactive</span>
                    )}
                  </div>
                  {!photoStream ? (
                    <button type="button" className="banner-action-btn" onClick={startCamera} style={{ width: "100%", justifyContent: "center" }}>
                      Start Camera Preview
                    </button>
                  ) : (
                    <button type="button" className="journey-start-button" onClick={capturePhoto} disabled={photoUploading} style={{ width: "100%", margin: 0 }}>
                      {photoUploading ? "Uploading..." : "Take Snapshot 📸"}
                    </button>
                  )}
                </div>

                <div className="media-tool-card">
                  <h3>🎙️ Audio Recording</h3>
                  <div className="media-preview-container" style={{ flexDirection: "column", background: audioRecording ? "#450a0a" : "#1e293b" }}>
                    <span style={{ fontSize: "36px" }}>{audioRecording ? "🎙️" : "🎧"}</span>
                    <span style={{ color: "white", fontWeight: "700", marginTop: "8px" }}>
                      {audioRecording ? `RECORDING: ${formatTimer(audioDuration)}` : "Ready to record"}
                    </span>
                  </div>
                  {!audioRecording ? (
                    <button type="button" className="journey-start-button" onClick={startAudioRecording} disabled={audioUploading} style={{ width: "100%", margin: 0 }}>
                      {audioUploading ? "Uploading..." : "Start Audio Recording 🎙️"}
                    </button>
                  ) : (
                    <button type="button" className="banner-action-btn end" onClick={stopAudioRecording} style={{ width: "100%", justifyContent: "center" }}>
                      Stop & Upload Audio 🛑
                    </button>
                  )}
                </div>

                <div className="media-tool-card">
                  <h3>📹 Video Clip Recording</h3>
                  <div className="media-preview-container" style={{ background: videoRecording ? "#450a0a" : "#1e293b" }}>
                    {videoRecording ? (
                      <div style={{ textAlign: "center", color: "white" }}>
                        <span style={{ fontSize: "32px" }}>📹</span>
                        <div style={{ fontWeight: "700", marginTop: "4px" }}>RECORDING: {formatTimer(videoDuration)}</div>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>Video camera ready</span>
                    )}
                  </div>
                  {!videoRecording ? (
                    <button type="button" className="journey-start-button" onClick={startVideoRecording} disabled={videoUploading} style={{ width: "100%", margin: 0 }}>
                      {videoUploading ? "Uploading..." : "Start Video Recording 📹"}
                    </button>
                  ) : (
                    <button type="button" className="banner-action-btn end" onClick={stopVideoRecording} style={{ width: "100%", justifyContent: "center" }}>
                      Stop & Upload Video 🛑
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "14px", marginTop: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <Link to="/sos/history" className="banner-action-btn" style={{ textDecoration: "none", padding: "12px 20px" }}>
              📜 View SOS Emergency Logs
            </Link>
            <Link to="/dashboard" className="back-to-dashboard-btn">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* 5-Second Countdown Modal */}
      {showCountdown && (
        <div className="sos-modal-overlay">
          <div className="sos-modal-content">
            <h2 style={{ color: "#ff0044", fontSize: "24px" }}>🚨 CONFIRM SOS ALERT</h2>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "15px" }}>Emergency alert will be sent in...</p>
            <div className="sos-countdown-circle">{countdown}</div>
            <div className="sos-modal-actions">
              <button type="button" className="btn-cancel-sos" onClick={cancelCountdown}>
                Cancel ✖
              </button>
              <button type="button" className="btn-send-now" onClick={triggerSOS}>
                Send Now 🚨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="sos-toast"
          style={{
            borderLeft: `5px solid ${toast.type === "error" ? "#ff0044" : toast.type === "success" ? "#10b981" : "#0284c7"}`,
          }}
        >
          {toast.msg}
        </div>
      )}
    </DashboardLayout>
  );
}

export default SOS;