import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Student Quiz Portal</h1>
        <p style={styles.subtitle}>
          Welcome! Please review the rules or proceed to register or log in.
        </p>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.primaryBtn }}
            onClick={() => navigate("/register")}
          >
            Register Now
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryBtn }}
            onClick={() => navigate("/login")}
          >
            Student Login
          </button>
        </div>

        {/* Rules Toggle */}
        <div style={styles.rulesContainer}>
          <button
            style={styles.toggleBtn}
            onClick={() => setShowRules(!showRules)}
          >
            {showRules ? "📖 Hide Quiz Rules" : "📜 Read Quiz Rules"}
          </button>

          {showRules && (
            <div style={styles.rulesBox}>
              <h3 style={{ marginTop: 0, color: "#333" }}>Quiz Instructions & Rules</h3>
              <ul style={styles.rulesList}>
                <li>
                  <strong>Registration:</strong> All students must register with a valid registration number before starting.
                </li>
                <li>
                  <strong>Time Limit:</strong> The quiz is strictly timed. The timer starts automatically upon entering the quiz page.
                </li>
                <li>
                  <strong>Submission:</strong> Ensure you click submit before the clock runs out to avoid automatic disqualification.
                </li>
                <li>
                  <strong>Single Attempt:</strong> Once submitted, you cannot retake or re-enter the active quiz session.
                </li>
                <li>
                  <strong>Fair Play:</strong> Do not refresh or navigate away from the quiz page during an active session.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  card: {
    maxWidth: "600px",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "35px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    margin: "0 0 10px 0",
    color: "#1a1a1a",
    fontSize: "28px",
  },
  subtitle: {
    color: "#666",
    fontSize: "15px",
    marginBottom: "30px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "25px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  primaryBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  secondaryBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
  },
  rulesContainer: {
    marginTop: "15px",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#007bff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  rulesBox: {
    marginTop: "15px",
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "left",
    borderLeft: "4px solid #007bff",
  },
  rulesList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#444",
    lineHeight: "1.6",
    fontSize: "14px",
  },
};