```jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import "./App.css";

function Registration() {
  const navigate = useNavigate();

  const [fieldsConfig, setFieldsConfig] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Hardcoded fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // --------------------------------------------------
  // Load registration configuration
  // --------------------------------------------------
  useEffect(() => {
    const loadRegistrationConfig = async () => {
      try {
        const response = await apiFetch("/registration-config");

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            `Expected JSON but received ${contentType}: ${text.slice(0, 200)}`
          );
        }

        const data = await response.json();

        if (data.success) {
          console.log(
            "✅ Registration config received:",
            data.registrationFields
          );

          const registrationFields = data.registrationFields || {};

          setFieldsConfig(registrationFields);

          // Initialize extra fields
          const initialForm = {};

          Object.keys(registrationFields).forEach((field) => {
            initialForm[field] = "";
          });

          setForm(initialForm);

          console.log("📝 Form initialised with:", initialForm);
        } else {
          console.error("❌ Failed to fetch config:", data);
        }
      } catch (err) {
        console.error("❌ Registration config error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRegistrationConfig();
  }, []);

  // --------------------------------------------------
  // Handle custom field changes
  // --------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Submit registration
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      // ----------------------------------------------
      // Validate name
      // ----------------------------------------------
      if (!name.trim()) {
        alert("Name is required.");
        return;
      }

      // ----------------------------------------------
      // Validate email
      // ----------------------------------------------
      if (!email.trim()) {
        alert("Email is required.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        alert("Please enter a valid email address.");
        return;
      }

      // ----------------------------------------------
      // Validate required custom fields
      // ----------------------------------------------
      const missing = [];

      for (const [field, settings] of Object.entries(fieldsConfig)) {
        if (
          settings?.enabled &&
          settings?.required &&
          !String(form[field] || "").trim()
        ) {
          missing.push(
            field.charAt(0).toUpperCase() + field.slice(1)
          );
        }
      }

      if (missing.length > 0) {
        alert(
          `Required fields missing: ${missing.join(", ")}`
        );
        return;
      }

      // ----------------------------------------------
      // Build registration payload
      // ----------------------------------------------
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };

      // Add enabled custom fields
      for (const [field, settings] of Object.entries(fieldsConfig)) {
        if (settings?.enabled) {
          payload[field] = form[field] || "";
        }
      }

      console.log("📤 Submitting registration payload:", payload);

      // ----------------------------------------------
      // Send registration request
      // ----------------------------------------------
      const response = await apiFetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // ----------------------------------------------
      // Registration endpoint returns PDF
      // ----------------------------------------------
      const contentType = response.headers.get("content-type") || "";

      if (response.ok) {
        if (contentType.includes("application/pdf")) {
          const blob = await response.blob();

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "registration-card.pdf";

          document.body.appendChild(a);
          a.click();
          a.remove();

          window.URL.revokeObjectURL(url);

          alert("✅ Registration successful! PDF downloaded.");

          navigate("/login");
          return;
        }

        // If backend unexpectedly returns JSON
        if (contentType.includes("application/json")) {
          const data = await response.json();

          if (data.success) {
            alert("✅ Registration successful!");
            navigate("/login");
          } else {
            alert(data.message || "Registration failed.");
          }

          return;
        }

        // Unexpected response type
        const text = await response.text();

        throw new Error(
          `Unexpected server response: ${text.slice(0, 300)}`
        );
      }

      // ----------------------------------------------
      // Handle server errors
      // ----------------------------------------------
      if (contentType.includes("application/json")) {
        const errorData = await response.json();

        alert(
          errorData.message ||
            `Registration failed (${response.status}).`
        );
      } else {
        const errorText = await response.text();

        console.error("Registration server error:", errorText);

        alert(
          `Registration failed (${response.status}).`
        );
      }
    } catch (err) {
      console.error("❌ Registration error:", err);

      alert(
        `Network/server error: ${
          err.message || "Please try again."
        }`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Render custom field
  // --------------------------------------------------
  const renderField = (fieldName, settings) => {
    const value = form[fieldName] || "";

    const label =
      fieldName.charAt(0).toUpperCase() +
      fieldName.slice(1);

    const required = Boolean(settings?.required);

    // ----------------------------------------------
    // Gender
    // ----------------------------------------------
    if (fieldName === "gender") {
      return (
        <div key={fieldName} className="form-group">
          <label className="form-label">
            Gender{" "}
            {required && (
              <span style={{ color: "var(--danger)" }}>
                *
              </span>
            )}
          </label>

          <div style={styles.radioGroup}>
            {["Male", "Female", "Other"].map((option) => {
              const isChecked = value === option;

              return (
                <label
                  key={option}
                  style={{
                    ...styles.radioLabel,
                    backgroundColor: isChecked
                      ? "var(--primary-light)"
                      : "var(--surface)",
                    borderColor: isChecked
                      ? "var(--primary)"
                      : "var(--border)",
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
                      backgroundColor: isChecked
                        ? "var(--primary)"
                        : "transparent",
                      borderColor: isChecked
                        ? "var(--primary)"
                        : "var(--border)",
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

    // ----------------------------------------------
    // Normal text/email fields
    // ----------------------------------------------
    const inputType =
      fieldName === "email" ? "email" : "text";

    const placeholder = `${label}${required ? " *" : ""}`;

    return (
      <div key={fieldName} className="form-group">
        <label className="form-label">
          {label}{" "}
          {required && (
            <span style={{ color: "var(--danger)" }}>
              *
            </span>
          )}
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

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div
          className="spinner"
          style={{
            width: 40,
            height: 40,
          }}
        />

        <p>Loading registration form...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Enabled custom fields
  // --------------------------------------------------
  const enabledFields = Object.entries(
    fieldsConfig
  ).filter(
    ([, settings]) => settings?.enabled
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          📝 Register for Quiz
        </h2>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name{" "}
              <span
                style={{
                  color: "var(--danger)",
                }}
              >
                *
              </span>
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="form-control"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email{" "}
              <span
                style={{
                  color: "var(--danger)",
                }}
              >
                *
              </span>
            </label>

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="form-control"
            />
          </div>

          {/* Custom fields */}
          {enabledFields.map(
            ([field, settings]) =>
              renderField(field, settings)
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  className="spinner"
                  style={{
                    width: 18,
                    height: 18,
                    borderWidth: 2,
                  }}
                />

                Registering...
              </span>
            ) : (
              "Register & Download PDF"
            )}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already registered?{" "}

          <button
            onClick={() => navigate("/login")}
            type="button"
            style={styles.linkBtn}
          >
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Registration;

// --------------------------------------------------
// Styles
// --------------------------------------------------

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
```
