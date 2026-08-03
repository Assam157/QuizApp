 import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <span style={styles.headerIcon}>🎓</span>
          </div>
          <h1 style={styles.title}>Student Quiz Portal</h1>
          <p style={styles.subtitle}>
            Welcome! Choose an option below to get started
          </p>
        </div>

        {/* Three Horizontal Cards */}
        <div style={styles.cardRow}>
          {/* Card 1: Quiz Rules */}
          <div
            style={styles.card}
            onClick={() => navigate("/rules")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(108, 92, 231, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            }}
          >
            <div style={{ ...styles.cardIconContainer, background: "linear-gradient(135deg, #6c5ce7, #a29bfe)" }}>
              <span style={styles.cardIcon}>📜</span>
            </div>
            <h3 style={styles.cardTitle}>Quiz Rules</h3>
            <p style={styles.cardDescription}>
              Read all instructions and guidelines before starting the quiz
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardLink}>View Rules</span>
              <span style={styles.cardArrow}>→</span>
            </div>
            <div style={{ ...styles.cardAccent, background: "linear-gradient(135deg, #6c5ce7, #a29bfe)" }}></div>
          </div>

          {/* Card 2: Register */}
          <div
            style={styles.card}
            onClick={() => navigate("/register")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(0, 184, 148, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            }}
          >
            <div style={{ ...styles.cardIconContainer, background: "linear-gradient(135deg, #00b894, #00cec9)" }}>
              <span style={styles.cardIcon}>📝</span>
            </div>
            <h3 style={styles.cardTitle}>Register Now</h3>
            <p style={styles.cardDescription}>
              Create your account with a valid registration number
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardLink}>Get Started</span>
              <span style={styles.cardArrow}>→</span>
            </div>
            <div style={{ ...styles.cardAccent, background: "linear-gradient(135deg, #00b894, #00cec9)" }}></div>
          </div>

          {/* Card 3: Login */}
          <div
            style={styles.card}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(253, 203, 110, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            }}
          >
            <div style={{ ...styles.cardIconContainer, background: "linear-gradient(135deg, #fdcb6e, #e17055)" }}>
              <span style={styles.cardIcon}>🔑</span>
            </div>
            <h3 style={styles.cardTitle}>Student Login</h3>
            <p style={styles.cardDescription}>
              Already registered? Login to access your quiz dashboard
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardLink}>Login</span>
              <span style={styles.cardArrow}>→</span>
            </div>
            <div style={{ ...styles.cardAccent, background: "linear-gradient(135deg, #fdcb6e, #e17055)" }}></div>
          </div>
        </div>

        {/* Bottom Info */}
        <div style={styles.bottomInfo}>
          <span style={styles.infoIcon}>ℹ️</span>
          <span style={styles.infoText}>
            Explore the National Science and Technology Digital Archive at{" "}
            <a href="https://www.nstad.in" target="_blank" rel="noopener noreferrer" style={styles.nstadLink}>
              www.nstad.in
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Home;

const styles = {
  // Page Background
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a40 40%, #24243e 100%)",
    fontFamily: "'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
  },

  // Decorative Background Elements
  bgCircle1: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
    pointerEvents: "none",
  },
  bgCircle2: {
    position: "fixed",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46,213,115,0.15) 0%, transparent 70%)",
    bottom: "-80px",
    left: "-80px",
    pointerEvents: "none",
  },
  bgCircle3: {
    position: "fixed",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(253,203,110,0.12) 0%, transparent 70%)",
    top: "50%",
    right: "5%",
    pointerEvents: "none",
  },

  // Container
  container: {
    maxWidth: "1000px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },

  // Header Section
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  iconWrapper: {
    width: "90px",
    height: "90px",
    borderRadius: "26px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 15px 35px rgba(108, 92, 231, 0.3)",
  },
  headerIcon: {
    fontSize: "44px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
    fontWeight: "400",
  },

  // Three Cards Row
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },

  // Individual Card
  card: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "32px 28px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  cardIconContainer: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  cardIcon: {
    fontSize: "30px",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 10px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    margin: "0 0 20px",
    flex: 1,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "16px",
    borderTop: "1px solid #eee",
  },
  cardLink: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6c5ce7",
  },
  cardArrow: {
    fontSize: "18px",
    color: "#6c5ce7",
    transition: "transform 0.3s ease",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
  },

  // Bottom Info
  bottomInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "14px 24px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  infoIcon: {
    fontSize: "16px",
  },
  infoText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  nstadLink: {
    color: "#a29bfe",
    fontWeight: "600",
    textDecoration: "underline",
  },
};
