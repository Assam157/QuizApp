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
          Test your knowledge, track your progress, and excel in your academic journey.
        </p>

        {/* Feature Cards */}
        <div style={styles.featureRow}>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <span style={styles.featureIcon}>⏱️</span>
            </div>
            <span style={styles.featureLabel}>Timed Quizzes</span>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <span style={styles.featureIcon}>📊</span>
            </div>
            <span style={styles.featureLabel}>Instant Results</span>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <span style={styles.featureIcon}>🔒</span>
            </div>
            <span style={styles.featureLabel}>Secure Access</span>
          </div>
        </div>

        {/* Action Buttons Card */}
        <div style={styles.actionCard}>
          <h3 style={styles.actionTitle}>Get Started</h3>
          <p style={styles.actionSubtitle}>Register now or login to begin your quiz</p>
          
          <div style={styles.buttonGroup}>
            <button
              style={styles.primaryBtn}
              onClick={() => navigate("/register")}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 12px 30px rgba(108, 92, 231, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(108, 92, 231, 0.25)";
              }}
            >
              <span style={styles.btnIcon}>📝</span>
              Register Now
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/login")}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 12px 30px rgba(46, 213, 115, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(46, 213, 115, 0.2)";
              }}
            >
              <span style={styles.btnIcon}>🔑</span>
              Student Login
            </button>
          </div>
        </div>

        {/* Rules Navigation Card */}
        <div style={styles.rulesCard}>
          <div style={styles.rulesCardContent}>
            <span style={styles.rulesIcon}>📜</span>
            <div style={styles.rulesText}>
              <strong style={styles.rulesTitle}>Quiz Rules & Guidelines</strong>
              <p style={styles.rulesDescription}>
                Read all instructions carefully before starting the quiz
              </p>
            </div>
          </div>
          <button
            style={styles.rulesBtn}
            onClick={() => navigate("/rules")}
          >
            View Rules →
          </button>
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
    maxWidth: "600px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  iconContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 10px 30px rgba(108, 92, 231, 0.3)",
  },
  icon: { fontSize: "40px" },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 8px",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "15px",
    textAlign: "center",
    marginBottom: "32px",
  },
  
  // Feature Cards
  featureRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  featureCard: {
    flex: "1 1 100px",
    minWidth: "120px",
    maxWidth: "160px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px 15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "all 0.3s ease",
  },
  featureIconWrapper: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: { fontSize: "24px" },
  featureLabel: { 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },

  // Action Card
  actionCard: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  actionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  actionSubtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 20px",
  },
  buttonGroup: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #6c5ce7, #5a4bd1)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(108, 92, 231, 0.25)",
    transition: "all 0.3s ease",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: "700",
    borderRadius: "14px",
    border: "2px solid #e0dcee",
    cursor: "pointer",
    background: "#fff",
    color: "#4a4a6a",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  btnIcon: { fontSize: "20px" },

  // Rules Card
  rulesCard: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    borderRadius: "16px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(108,92,231,0.3)",
    flexWrap: "wrap",
  },
  rulesCardContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  rulesIcon: {
    fontSize: "28px",
  },
  rulesText: {
    color: "#fff",
  },
  rulesTitle: {
    fontSize: "15px",
    display: "block",
    marginBottom: "2px",
  },
  rulesDescription: {
    fontSize: "12px",
    color: "#aaa",
    margin: 0,
  },
  rulesBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
};
