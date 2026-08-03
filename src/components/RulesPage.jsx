import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🎓</span>
        </div>
        <h1 style={styles.title}>Student Quiz Portal</h1>
        <p style={styles.subtitle}>
          Welcome! Please review the rules or proceed to register or log in.
        </p>

        <div style={styles.featureRow}>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>⏱️</span>
            <span style={styles.featureLabel}>Timed Quizzes</span>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📊</span>
            <span style={styles.featureLabel}>Instant Results</span>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>🔒</span>
            <span style={styles.featureLabel}>Secure Access</span>
          </div>
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Get Started</span>
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/register")}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 8px 25px rgba(108, 92, 231, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(108, 92, 231, 0.25)";
            }}
          >
            <span style={styles.btnIcon}>📝</span> Register Now
          </button>
          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 8px 25px rgba(46, 213, 115, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(46, 213, 115, 0.25)";
            }}
          >
            <span style={styles.btnIcon}>🔑</span> Student Login
          </button>
        </div>

        {/* Button to navigate to separate rules page */}
        <button
          style={styles.rulesLinkBtn}
          onClick={() => navigate("/rules")}
        >
          📜 Read Quiz Rules
        </button>
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
    background: "linear-gradient(135deg, #0f0c29, #1a1a40, #24243e)",
    fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,92,231,0.25) 0%, transparent 70%)",
    top: "-80px",
    right: "-60px",
    pointerEvents: "none",
  },
  bgCircle2: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46,213,115,0.2) 0%, transparent 70%)",
    bottom: "-70px",
    left: "-50px",
    pointerEvents: "none",
  },
  card: {
    maxWidth: "620px",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: "20px",
    padding: "40px 36px 32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(10px)",
  },
  iconContainer: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 8px 25px rgba(108, 92, 231, 0.3)",
  },
  icon: { fontSize: "34px", lineHeight: 1 },
  title: {
    margin: "0 0 8px 0",
    fontSize: "30px",
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#5a5a7a",
    fontSize: "15px",
    lineHeight: "1.6",
    marginBottom: "24px",
    maxWidth: "420px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  featureRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  featureCard: {
    flex: "1 1 100px",
    minWidth: "100px",
    maxWidth: "140px",
    backgroundColor: "#f8f7ff",
    borderRadius: "14px",
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #eeeafc",
  },
  featureIcon: { fontSize: "26px", lineHeight: 1 },
  featureLabel: { fontSize: "12px", fontWeight: "600", color: "#4a4a6a" },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },
  dividerText: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    margin: "0 auto",
    padding: "0 16px",
    background: "rgba(255,255,255,0.97)",
  },
  buttonGroup: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "700",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #6c5ce7, #5a4bd1)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(108, 92, 231, 0.25)",
    transition: "all 0.25s ease",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "700",
    borderRadius: "12px",
    border: "2px solid #e0dcee",
    cursor: "pointer",
    background: "#fff",
    color: "#4a4a6a",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "all 0.25s ease",
  },
  btnIcon: { fontSize: "18px", lineHeight: 1 },
  rulesLinkBtn: {
    marginTop: "12px",
    background: "none",
    border: "none",
    color: "#6c5ce7",
    fontSize: "15px",
    fontWeight: "700",
    textDecoration: "underline",
    cursor: "pointer",
    transition: "color 0.2s",
  },
};
