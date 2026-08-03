 import React from "react";
import { useNavigate } from "react-router-dom";

function RulesPage() {
  const navigate = useNavigate();

  const rules = [
    {
      id: "01",
      icon: "👥",
      title: "Eligibility",
      description: "Open to students of Class XI, Class XII, and Undergraduates from any recognized institution. Participation is free and only one entry per participant.",
      color: "#6c5ce7",
      gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    },
    {
      id: "02",
      icon: "📚",
      title: "Quiz Format",
      description: "Multiple-choice questions (MCQs) based on archival documents of Acharya Prafulla Chandra Ray.",
      link: "Explore www.nstad.in beforehand.",
      linkUrl: "https://www.nstad.in",
      color: "#e17055",
      gradient: "linear-gradient(135deg, #e17055, #d63031)",
    },
    {
      id: "03",
      icon: "📤",
      title: "Submission Guidelines",
      description: "The quiz will be available only on the scheduled date and time. Responses submitted after the closing time will not be considered. Once submitted, answers cannot be changed.",
      color: "#00b894",
      gradient: "linear-gradient(135deg, #00b894, #00cec9)",
    },
    {
      id: "04",
      icon: "⏱️",
      title: "Time Limit",
      description: "25 MCQs will appear one by one. Duration is 25 minutes – the quiz will automatically close at the end time.",
      color: "#fdcb6e",
      gradient: "linear-gradient(135deg, #fdcb6e, #e17055)",
    },
    {
      id: "05",
      icon: "📊",
      title: "Evaluation",
      description: "+1 for each correct answer, −1 for each wrong answer (negative marking). In case of a tie, earlier submission time gets preference.",
      color: "#6c5ce7",
      gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    },
    {
      id: "06",
      icon: "🤝",
      title: "Fair Participation",
      description: "Answer independently. Unfair means or multiple entries may lead to disqualification. Organizers reserve the right to verify details.",
      color: "#e17055",
      gradient: "linear-gradient(135deg, #e17055, #fdcb6e)",
    },
    {
      id: "07",
      icon: "🏆",
      title: "Results",
      description: "Winners are decided by highest score; if tied, faster response time wins. The organizing committee's decision is final.",
      color: "#2d3436",
      gradient: "linear-gradient(135deg, #2d3436, #636e72)",
    },
    {
      id: "08",
      icon: "📜",
      title: "Disclaimer",
      description: "By participating, you agree to abide by these rules. Organizers are not responsible for poor internet connectivity. No extensions will be granted. The quiz may be modified or cancelled without prior notice.",
      color: "#6c5ce7",
      gradient: "linear-gradient(135deg, #6c5ce7, #5a4bd1)",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.container}>
        {/* Back Button */}
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          <span>←</span>
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <span style={styles.headerIcon}>📜</span>
          </div>
          <h1 style={styles.title}>NSTAD Online Quiz</h1>
          <p style={styles.subtitle}>Rules & Regulations</p>
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            Please read carefully before starting
          </div>
        </div>

        {/* Rules Cards Grid */}
        <div style={styles.rulesGrid}>
          {rules.map((rule) => (
            <div key={rule.id} style={styles.ruleCard}>
              <div style={styles.ruleCardHeader}>
                <div style={{ ...styles.ruleNumber, background: rule.gradient }}>
                  {rule.id}
                </div>
                <div style={styles.ruleIconContainer}>
                  <span style={styles.ruleIcon}>{rule.icon}</span>
                </div>
                <h3 style={styles.ruleTitle}>{rule.title}</h3>
              </div>
              <p style={styles.ruleDescription}>{rule.description}</p>
              {rule.link && (
                <a
                  href={rule.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.ruleLink}
                >
                  {rule.link}
                </a>
              )}
              <div style={{ ...styles.ruleAccent, background: rule.color }}></div>
            </div>
          ))}
        </div>

        {/* NSTAD Card */}
        <div style={styles.nstadCard}>
          <div style={styles.nstadContent}>
            <span style={styles.nstadIcon}>🌐</span>
            <div>
              <strong style={styles.nstadTitle}>National Science and Technology Digital Archive</strong>
              <p style={styles.nstadDescription}>
                Explore archival documents of Acharya Prafulla Chandra Ray before taking the quiz
              </p>
            </div>
          </div>
          <a
            href="https://www.nstad.in"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.nstadBtn}
          >
            Visit www.nstad.in →
          </a>
        </div>
      </div>
    </div>
  );
}

export default RulesPage;

const styles = {
  // Page Background
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #1a1a40, #24243e)",
    fontFamily: "'Segoe UI', 'Inter', system-ui, sans-serif",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
  },
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

  // Container
  container: {
    maxWidth: "700px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },

  // Back Button
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "30px",
    padding: "10px 20px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "24px",
    transition: "all 0.3s ease",
  },

  // Header
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 12px 30px rgba(108, 92, 231, 0.3)",
  },
  headerIcon: { fontSize: "38px" },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#a29bfe",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(108,92,231,0.2)",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#a29bfe",
    fontWeight: "600",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#a29bfe",
  },

  // Rules Grid
  rulesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  // Rule Card
  ruleCard: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  ruleCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  ruleNumber: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "800",
    fontSize: "14px",
    flexShrink: 0,
  },
  ruleIconContainer: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#f8f7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ruleIcon: { fontSize: "20px" },
  ruleTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  ruleDescription: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: "0 0 8px",
  },
  ruleLink: {
    display: "inline-block",
    color: "#6c5ce7",
    fontWeight: "600",
    fontSize: "13px",
    textDecoration: "underline",
  },
  ruleAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
  },

  // NSTAD Card
  nstadCard: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    border: "1px solid rgba(108,92,231,0.3)",
  },
  nstadContent: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
    color: "#fff",
  },
  nstadIcon: { fontSize: "32px", flexShrink: 0 },
  nstadTitle: {
    fontSize: "15px",
    display: "block",
    marginBottom: "4px",
  },
  nstadDescription: {
    fontSize: "13px",
    color: "#aaa",
    margin: 0,
    lineHeight: "1.5",
  },
  nstadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },
};
