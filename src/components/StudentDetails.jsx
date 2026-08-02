 import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Registration() {
  const navigate = useNavigate();
  const [fieldsConfig, setFieldsConfig] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Hardcoded fields (always present)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("https://quizappbackend-xngu.onrender.com/registration-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          console.log("✅ Registration config received:", data.registrationFields);
          setFieldsConfig(data.registrationFields);
          // Initialize form with empty values for all enabled fields (extra fields only)
          const initialForm = {};
          Object.keys(data.registrationFields).forEach((field) => {
            initialForm[field] = "";
          });
          setForm(initialForm);
          console.log("📝 Form initialised with:", initialForm);
        } else {
          console.error("❌ Failed to fetch config:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ---- Validate hardcoded fields ----
    if (!name.trim()) {
      alert("Name is required.");
      setSubmitting(false);
      return;
    }
    if (!email.trim()) {
      alert("Email is required.");
      setSubmitting(false);
      return;
    }
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }

    // ---- Check required extra fields ----
    const missing = [];
    for (const [field, settings] of Object.entries(fieldsConfig)) {
      if (settings.enabled && settings.required && !form[field]) {
        missing.push(field.charAt(0).toUpperCase() + field.slice(1));
      }
    }
    if (missing.length) {
      alert(`Required fields missing: ${missing.join(", ")}`);
      setSubmitting(false);
      return;
    }

    // ---- Build payload ----
    const payload = {
      name: name.trim(),
      email: email.trim(),
    };
    // Add extra custom fields
    for (const [field, settings] of Object.entries(fieldsConfig)) {
      if (settings.enabled) {
        payload[field] = form[field] || "";
      }
    }
    console.log("📤 Submitting payload:", payload);

    try {
      const res = await fetch("https://quizappbackend-xngu.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "registration-card.pdf";
        a.click();
        URL.revokeObjectURL(url);
        alert("✅ Registration successful! PDF downloaded.");
        navigate("/login");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Registration failed.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: render field input for extra custom fields
  const renderField = (fieldName, settings) => {
    const value = form[fieldName] || "";
    const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const required = settings.required;

    // Special case: gender → radio buttons
    if (fieldName === "gender") {
      return (
        <div key={fieldName} className="form-group">
          <label className="form-label">
            Gender {required && <span style={{ color: "var(--danger)" }}>*</span>}
          </label>
          <div style={styles.radioGroup}>
            {["Male", "Female", "Other"].map((option) => {
              const isChecked = value === option;
              return (
                <label
                  key={option}
                  style={{
                    ...styles.radioLabel,
                    backgroundColor: isChecked ? "var(--primary-light)" : "var(--surface)",
                    borderColor: isChecked ? "var(--primary)" : "var(--border)",
                    borderWidth: 2,
                    borderStyle: "solid",
                  }}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={isChecked}
                    onChange={handleChange}
                    required={required}
                    style={styles.radioInput}
                  />
                  <span
                    style={{
                      ...styles.radioCustom,
                      backgroundColor: isChecked ? "var(--primary)" : "transparent",
                      borderColor: isChecked ? "var(--primary)" : "var(--border)",
                    }}
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    // All other fields – text/email input
    const inputType = fieldName === "email" ? "email" : "text";
    const placeholder = `${label}${required ? " *" : ""}`;
    return (
      <div key={fieldName} className="form-group">
        <label className="form-label">
          {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
        <input
          type={inputType}
          name={fieldName}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          className="form-control"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p>Loading registration form...</p>
      </div>
    );
  }

  // Get enabled extra fields from config
  const enabledFields = Object.entries(fieldsConfig).filter(([_, settings]) => settings.enabled);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Register for Quiz</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* ---- Hardcoded Name field ---- */}
          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-control"
            />
          </div>

          {/* ---- Hardcoded Email field ---- */}
          <div className="form-group">
            <label className="form-label">Email <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>

          {/* ---- Extra custom fields from admin config ---- */}
          {enabledFields.map(([field, settings]) => renderField(field, settings))}

          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Registering...
              </span>
            ) : (
              "Register & Download PDF"
            )}
          </button>
        </form>
        <p style={styles.loginLink}>
          Already registered?{" "}
          <button onClick={() => navigate("/login")} type="button" style={styles.linkBtn}>
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Registration;

// ---------- Local styles ----------
const styles = {
  pageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "var(--background)",
    padding: "1.5rem",
  },
  card: {
    backgroundColor: "var(--surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    padding: "2.5rem",
    maxWidth: 500,
    width: "100%",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "var(--text)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  radioGroup: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "0.25rem",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.4rem 0.8rem",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "var(--text)",
    transition: "all 0.2s",
    flex: "0 1 auto",
  },
  radioInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: "none",
  },
  radioCustom: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid var(--border)",
    display: "inline-block",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    backgroundColor: "var(--primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "0.5rem",
  },
  loginLink: {
    marginTop: "1.5rem",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "var(--primary)",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "0.95rem",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "1rem",
    backgroundColor: "var(--background)",
    color: "var(--text-secondary)",
  },
};
