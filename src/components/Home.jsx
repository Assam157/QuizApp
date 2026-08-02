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
              <h3 style={{ marginTop: 0, color: "#1a237e" }}>NSTAD Online Quiz – Rules & Regulations</h3>
              <ul style={styles.rulesList}>
                <li>
                  <strong>Eligibility:</strong> Open to students of Class XI, Class XII, and Undergraduates from any recognized institution. Participation is free and only one entry per participant.
                </li>
                <li>
                  <strong>Quiz Format:</strong> Multiple-choice questions (MCQs) based on archival documents of Acharya Prafulla Chandra Ray. Explore <a href="https://www.nstad.in" target="_blank" rel="noopener noreferrer">www.nstad.in</a> beforehand.
                </li>
                <li>
                  <strong>Submission Guidelines:</strong> The quiz will be available only on the scheduled date and time. Responses submitted after the closing time will not be considered. Once submitted, answers cannot be changed.
                </li>
                <li>
                  <strong>Time:</strong> 25 MCQs will appear one by one. Duration is 25 minutes – the quiz will automatically close at the end time.
                </li>
                <li>
                  <strong>Evaluation:</strong> +1 for each correct answer, <strong>−1</strong> for each wrong answer (negative marking). In case of a tie, earlier submission time gets preference.
                </li>
                <li>
                  <strong>Fair Participation:</strong> Answer independently. Unfair means or multiple entries may lead to disqualification. Organizers reserve the right to verify details.
                </li>
                <li>
                  <strong>Results:</strong> Winners are decided by highest score; if tied, faster response time wins. The organizing committee’s decision is final.
                </li>
                <li>
                  <strong>Disclaimer:</strong> By participating, you agree to abide by these rules. Organizers are not responsible for poor internet connectivity. No extensions will be granted. The quiz may be modified or cancelled without prior notice.
                </li>
              </ul>
              <p style={{ marginTop: "12px", fontSize: "13px", color: "#555" }}>
                📌 Explore the National Science and Technology Digital Archive: <a href="https://www.nstad.in" target="_blank" rel="noopener noreferrer">www.nstad.in</a>
              </p>
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
    borderLeft: "4px solid #1a237e",
  },
  rulesList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#444",
    lineHeight: "1.8",
    fontSize: "14px",
  },
};
