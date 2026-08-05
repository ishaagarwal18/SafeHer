import { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiSave, FiUser, FiPhone, FiFileText } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./EditProfileModal.css";

function EditProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setMedicalNotes(user.medicalNotes || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      phone: phone.trim(),
      medicalNotes: medicalNotes.trim(),
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-card" onClick={(e) => e.stopPropagation()}>
        <div className="epm-header">
          <div className="epm-header-title">
            <span className="epm-icon">✏️</span>
            <div>
              <h3>Edit Profile Information</h3>
              <p>Update your details instantly across SafeHer</p>
            </div>
          </div>
          <button className="epm-close-btn" onClick={onClose} title="Close">
            <FiX />
          </button>
        </div>

        {saved && (
          <div className="epm-alert-success">
            <FiCheckCircle /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="epm-form">
          <div className="epm-field">
            <label>
              <FiUser /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="epm-field">
            <label>
              <FiPhone /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="epm-field">
            <label>
              <FiFileText /> Emergency Medical Notes / Info
            </label>
            <textarea
              rows="3"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="Blood group, allergies, emergency contacts..."
            />
          </div>

          <div className="epm-actions">
            <button type="button" className="epm-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="epm-save-btn">
              <FiSave /> Save Changes
            </button>
          </div>

          <div className="epm-footer">
            <Link to="/profile" onClick={onClose} className="epm-link">
              Go to Full Profile Page →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
