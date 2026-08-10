 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [regNo, setRegNo] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          regNo: regNo.trim(),
          email: email.trim(),
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      // Make sure backend actually returned JSON
      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Login returned non-JSON response:",
          text
        );

        throw new Error(
          "Server returned an invalid response. Please try again."
        );
      }

      const data = await response.json();

      if (data.success) {
        navigate("/quiz", {
          state: {
            student: data.student,
            examStartTime: data.examStartTime,
            examDuration: data.examDuration,
          },
        });
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          🔐 Student Login
        </h2>

        <form
          onSubmit={handleLogin}
          style={styles.form}
        >
          {/* Registration Number */}
          <div className="form-group">
            <label className="form-label">
              Registration Number
            </label>

            <input
              type="text"
              placeholder="e.g., TRV-0001"
              value={regNo}
              onChange={(e) =>
                setRegNo(e.target.value)
              }
              required
              className="form-control"
              autoComplete="username"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="form-control"
              autoComplete="email"
            />
          </div>

          {/* Login button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
            disabled={loading}
          >
            {loading
              ? "Checking..."
              : "Enter Quiz"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        {/* Navigation links */}
        <p style={styles.registerLink}>
          Not registered?{" "}

          <button
            onClick={() => navigate("/register")}
            type="button"
            style={styles.linkBtn}
          >
            Register now
          </button>
        </p>

        <p style={styles.registerLink}>
          <button
            onClick={() => navigate("/")}
            type="button"
            style={styles.linkBtn}
          >
            Go to home
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

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
    maxWidth: 450,
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

  error: {
    color: "var(--danger)",
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "0.95rem",
  },

  registerLink: {
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
};
 
