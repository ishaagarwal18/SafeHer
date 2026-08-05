import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/features.css";
import { dashboardApi } from "../services/api";

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

      // Send 15-second continuous GPS updates
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

  // Start SOS Flow
  const handleSOSClick = () => {
    if (activeSession) {
      showToast("An SOS emergency session is already active!", "warning");
      return;
    }
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

  // End SOS Session ("I'm Safe")
  const handleImSafe = async () => {
    if (!activeSession) return;
    setLoading(true);

    // Stop Media Recorders if active
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

  // Photo Capture Logic
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

      // Upload to backend
      setPhotoUploading(true);
      const formData = new FormData();
      formData.append("session_id", activeSession.id);
      formData.append("photo", file);

      try {
        await dashboardApi.post("api/sos/upload-photo/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("📷 Photo uploaded successfully!", "success");
      } catch (_) {
        showToast("Failed to upload photo.", "error");
      } finally {
        setPhotoUploading(false);
      }
    }, "image/jpeg");
  };

  // Audio Recording Logic
  const startAudioRecording = async () => {
    if (!activeSession) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      audioRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      audioRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `sos_audio_${Date.now()}.webm`, { type: "audio/webm" });

        setAudioUploading(true);
        const formData = new FormData();
        formData.append("session_id", activeSession.id);
        formData.append("audio", file);
        formData.append("duration", audioDuration);

        try {
          await dashboardApi.post("api/sos/upload-audio/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          showToast("🎙️ Audio recording uploaded!", "success");
        } catch (_) {
          showToast("Failed to upload audio.", "error");
        } finally {
          setAudioUploading(false);
        }
      };

      audioRecorderRef.current.start();
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

  // Video Recording Logic
  const startVideoRecording = async () => {
    if (!activeSession) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      videoRecorderRef.current = new MediaRecorder(stream);
      videoChunksRef.current = [];

      videoRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      videoRecorderRef.current.onstop = async () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: "video/webm" });
        const file = new File([videoBlob], `sos_video_${Date.now()}.webm`, { type: "video/webm" });

        setVideoUploading(true);
        const formData = new FormData();
        formData.append("session_id", activeSession.id);
        formData.append("video", file);
        formData.append("duration", videoDuration);

        try {
          await dashboardApi.post("api/sos/upload-video/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          showToast("📹 Video recording uploaded!", "success");
        } catch (_) {
          showToast("Failed to upload video.", "error");
        } finally {
          setVideoUploading(false);
        }
      };

      videoRecorderRef.current.start();
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
    <>
      <div className="container">
        <h1 className="page-title">🚨 Emergency SOS Console</h1>

        {/* 1. Smart SOS Button Section */}
        {!activeSession ? (
          <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2>Need Immediate Emergency Help?</h2>
            <p style={{ color: "#64748b", margin: "8px 0 30px" }}>
              Press the SOS button below. Trusted contacts will be instantly notified with your live GPS location.
            </p>

            <div className="sos-button-wrapper">
              <div className="sos-ripple-ring ring-1"></div>
              <div className="sos-ripple-ring ring-2"></div>
              <div className="sos-ripple-ring ring-3"></div>

              <button
                type="button"
                className="sos-smart-btn"
                onClick={handleSOSClick}
                disabled={loading}
              >
                <span>🚨</span>
                <span>{loading ? "SENDING..." : "SOS"}</span>
              </button>
            </div>

            <div style={{ marginTop: "20px", fontSize: "14px", color: "#64748b" }}>
              📍 <strong>Current Location:</strong> {locationName || "Fetching GPS coordinates..."}
            </div>
          </div>
        ) : (
          /* 6. Active Emergency Status Console */
          <div className="card active-emergency-card">
            <div className="emergency-status-badge">
              <span className="live-dot"></span>
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

            {/* 7. "I'm Safe" Button */}
            <button type="button" className="btn-im-safe" onClick={handleImSafe} disabled={loading}>
              <span>🛡️</span>
              <span>{loading ? "SAVING..." : "I'M SAFE NOW (End Emergency)"}</span>
            </button>
          </div>
        )}

        {/* 9, 10, 11. Media Recording Tools (Available during Active SOS) */}
        {activeSession && (
          <div className="card">
            <h2>📷 Media Evidence Recording Tools</h2>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
              Capture photos, audio, or video evidence. Media files will be stored securely with this SOS session.
            </p>

            <div className="media-tools-grid">
              {/* Photo Tool */}
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
                  <button type="button" className="btn-sm" onClick={startCamera} style={{ width: "100%" }}>
                    Start Camera Preview
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn"
                    onClick={capturePhoto}
                    disabled={photoUploading}
                    style={{ width: "100%", fontSize: "13px" }}
                  >
                    {photoUploading ? "Uploading..." : "Take Snapshot 📸"}
                  </button>
                )}
              </div>

              {/* Audio Tool */}
              <div className="media-tool-card">
                <h3>🎙️ Audio Recording</h3>
                <div
                  className="media-preview-container"
                  style={{ flexDirection: "column", background: audioRecording ? "#450a0a" : "#1e293b" }}
                >
                  <span style={{ fontSize: "36px" }}>{audioRecording ? "🎙️" : "🎧"}</span>
                  <span style={{ color: "white", fontWeight: "700", marginTop: "8px" }}>
                    {audioRecording ? `RECORDING: ${formatTimer(audioDuration)}` : "Ready to record"}
                  </span>
                </div>

                {!audioRecording ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={startAudioRecording}
                    disabled={audioUploading}
                    style={{ width: "100%", fontSize: "13px" }}
                  >
                    {audioUploading ? "Uploading..." : "Start Audio Recording 🎙️"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={stopAudioRecording}
                    style={{ width: "100%", fontSize: "13px", padding: "10px" }}
                  >
                    Stop & Upload Audio 🛑
                  </button>
                )}
              </div>

              {/* Video Tool */}
              <div className="media-tool-card">
                <h3>📹 Video Clip Recording</h3>
                <div
                  className="media-preview-container"
                  style={{ background: videoRecording ? "#450a0a" : "#1e293b" }}
                >
                  {videoRecording ? (
                    <div style={{ textAlignment: "center", color: "white" }}>
                      <span style={{ fontSize: "32px" }}>📹</span>
                      <div style={{ fontWeight: "700", marginTop: "4px" }}>
                        RECORDING: {formatTimer(videoDuration)}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>Video camera ready</span>
                  )}
                </div>

                {!videoRecording ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={startVideoRecording}
                    disabled={videoUploading}
                    style={{ width: "100%", fontSize: "13px" }}
                  >
                    {videoUploading ? "Uploading..." : "Start Video Recording 📹"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={stopVideoRecording}
                    style={{ width: "100%", fontSize: "13px", padding: "10px" }}
                  >
                    Stop & Upload Video 🛑
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="nav-links" style={{ textAlign: "center", margin: "20px 0", display: "flex", justifyContent: "center", gap: "14px" }}>
        <Link to="/sos/history" className="btn-secondary" style={{ padding: "10px 22px", borderRadius: "12px", textDecoration: "none", fontWeight: "600" }}>
          📜 View SOS History
        </Link>
        <Link to="/dashboard" className="back-dashboard-btn">
          ← Back to Dashboard
        </Link>
      </div>

      {/* 2 & 3. 5-Second Countdown Modal */}
      {showCountdown && (
        <div className="sos-modal-overlay">
          <div className="sos-modal-content">
            <h2 style={{ color: "#ff0044", fontSize: "24px" }}>🚨 CONFIRM SOS ALERT</h2>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "15px" }}>
              Emergency alert will be sent in...
            </p>

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

      {/* Toast Notification */}
      {toast && (
        <div
          className="sos-toast"
          style={{
            borderLeft: `5px solid ${
              toast.type === "error" ? "#ff0044" : toast.type === "success" ? "#10b981" : "#0284c7"
            }`,
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default SOS;