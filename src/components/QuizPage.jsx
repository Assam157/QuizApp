 import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

// ---------- Utility: Fisher–Yates shuffle ----------
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ---------- Custom hook for mobile detection ----------
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

function QuizPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const student = state?.student;
  const examStartTime = state?.examStartTime ? new Date(state.examStartTime) : null;
  const examDuration = state?.examDuration || 30;
  const isMobile = useIsMobile();

  const [questions, setQuestions] = useState([]);
  const [quizReady, setQuizReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(examDuration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [waitTime, setWaitTime] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [disqualified, setDisqualified] = useState(false);
  const [disqualifiedMessage, setDisqualifiedMessage] = useState("");
  const timerRef = useRef(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (!student) navigate("/login");
  }, [student, navigate]);

  // Check disqualification status (after refresh)
  useEffect(() => {
    if (!student) return;
    const checkDisqualification = async () => {
      try {
        const res = await fetch(`${API_BASE}/my-rank?regNo=${student.regNo}`);
        const data = await res.json();
        if (data.success && data.disqualified) {
          setDisqualified(true);
          setDisqualifiedMessage("You have been disqualified.");
          setQuizActive(false);
        }
      } catch (err) {
        console.debug("Disqualification check skipped:", err.message);
      }
    };
    checkDisqualification();
  }, [student]);

  useEffect(() => {
    if (quizActive || !student) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/quiz-status`);
        const data = await res.json();
        if (data.isQuizOpen) {
          setQuizActive(true);
        } else if (data.hasEnded) {
          alert("The quiz has ended. You cannot take it now.");
          navigate("/login");
        } else {
          if (examStartTime) {
            const diff = Math.ceil((new Date(data.startTime) - new Date()) / 1000);
            setWaitTime(diff > 0 ? diff : 0);
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [quizActive, student, navigate, examStartTime]);

  // ---------- Fetch questions and shuffle ----------
  useEffect(() => {
    if (!quizActive) return;

    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setQuizReady(false);
      setQuestionsError(null);

      try {
        await fetch(`${API_BASE}/start-quiz`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            regNo: student.regNo,
          }),
        });

        const res = await fetch(`${API_BASE}/get-questions`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        const withIndex = data.questions.map((q, idx) => ({
          ...q,
          originalIndex: idx,
        }));

        const shuffled = shuffleArray(withIndex);

        setQuestions(shuffled);
        setAnswers(new Array(shuffled.length).fill(null));

        setQuizReady(true);
      } catch (err) {
        setQuestionsError(err.message);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [quizActive, student.regNo]);

  // ---------- Auto-submit on timer end ----------
  const handleTimeExpired = useCallback(() => {
    if (autoSubmitted.current) return;
    autoSubmitted.current = true;
    submitQuiz(true);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!quizActive || submitted || questions.length === 0 || disqualified) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizActive, submitted, questions, disqualified, handleTimeExpired]);

  // ---------- Navigation ----------
  const goTo = (idx) => {
    if (idx >= 0 && idx < questions.length) setCurrent(idx);
  };

  const selectAnswer = (key) => {
    const updated = [...answers];
    updated[current] = key;
    setAnswers(updated);
  };

  const clearAnswer = () => {
    const updated = [...answers];
    updated[current] = null;
    setAnswers(updated);
  };

  // ---------- Submit quiz ----------
  const submitQuiz = async (auto = false) => {
    if (submitted) return;
    if (!auto && !window.confirm("Are you sure you want to submit the quiz?")) return;
    setSubmitted(true);
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const originalAnswers = new Array(questions.length).fill(null);
      questions.forEach((q, shuffledIndex) => {
        originalAnswers[q.originalIndex] = answers[shuffledIndex];
      });

      const res = await fetch(`${API_BASE}/submit-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo: student.regNo, answers: originalAnswers }),
      });
      const data = await res.json();
      if (data.disqualified) {
        setDisqualified(true);
        setDisqualifiedMessage(data.message || "Time's up! You have been disqualified.");
        setSubmitting(false);
      } else {
        navigate("/result", { state: { ...data, student, totalQuestions: questions.length } });
      }
    } catch (err) {
      alert("Submission failed: " + err.message);
      setSubmitted(false);
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Render helpers ----------
  const renderLoading = (title, desc) => (
    <div style={styles(isMobile).loadingOverlay}>
      <div
        className="spinner"
        style={{
          margin: "1rem auto",
          width: 50,
          height: 50,
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #0066b3",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <h2 style={{ color: "#000" }}>{title}</h2>
      {desc && <p style={{ color: "#000" }}>{desc}</p>}
    </div>
  );

  // ---------- Disqualified overlay ----------
  if (disqualified) {
    return (
      <div style={styles(isMobile).waitContainer}>
        <div style={styles(isMobile).overlay}>
          <div style={{ ...styles(isMobile).warningCard, border: "3px solid #dc2626" }}>
            <h2 style={{ color: "#dc2626" }}>⛔ {disqualifiedMessage || "You have been disqualified"}</h2>
            <p style={{ color: "#000" }}>You cannot continue with this quiz.</p>
            <button onClick={() => navigate("/login")} style={styles(isMobile).submitBtn}>
              Go to Login
            </button>
          </div>
        </div>
        <div style={styles(isMobile).blurredQuiz}>
          {/* blurred placeholder – same as original */}
          <div style={styles(isMobile).fakeHeader}>
            <div style={styles(isMobile).fakeLogo} />
            <div style={styles(isMobile).fakeStudent}>
              <div style={styles(isMobile).fakeLine} />
              <div style={{ ...styles(isMobile).fakeLine, width: "70%" }} />
            </div>
            <div style={styles(isMobile).fakeTimer} />
          </div>
          <div style={styles(isMobile).fakeBody}>
            <div style={styles(isMobile).fakeQuestionCard}>
              <div style={{ ...styles(isMobile).fakeLine, width: "85%", height: 24 }} />
              <div style={{ height: 30 }} />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles(isMobile).fakeOption}>
                  <div style={styles(isMobile).fakeRadio} />
                  <div style={{ ...styles(isMobile).fakeLine, flex: 1 }} />
                </div>
              ))}
              <div style={{ height: 30 }} />
              <div style={styles(isMobile).fakeButtons}>
                <div style={styles(isMobile).fakeButton} />
                <div style={styles(isMobile).fakeButton} />
              </div>
            </div>
            <div style={styles(isMobile).fakeSidebar}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={styles(isMobile).fakePalette} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Waiting screen ----------
  if (!quizActive) {
    const mins = Math.floor((waitTime || 0) / 60);
    const secs = (waitTime || 0) % 60;
    const startTimeStr = examStartTime
      ? examStartTime.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })
      : "soon";

    return (
      <div style={styles(isMobile).waitContainer}>
        <div style={styles(isMobile).overlay}>
          <div style={styles(isMobile).warningCard}>
            <h2 style={{ color: "#000" }}>🔒 Exam not started yet</h2>
            <p style={{ color: "#000" }}>
              Scheduled start at <strong>{startTimeStr}</strong> IST
            </p>
            <div style={{ ...styles(isMobile).countdown, color: "#0066b3" }}>
              {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
            </div>
            <p style={{ color: "#000" }}>
              The page will refresh automatically when the exam begins.
            </p>
          </div>
        </div>
        <div style={styles(isMobile).blurredQuiz}>
          {/* same placeholder as above */}
          <div style={styles(isMobile).fakeHeader}>
            <div style={styles(isMobile).fakeLogo} />
            <div style={styles(isMobile).fakeStudent}>
              <div style={styles(isMobile).fakeLine} />
              <div style={{ ...styles(isMobile).fakeLine, width: "70%" }} />
            </div>
            <div style={styles(isMobile).fakeTimer} />
          </div>
          <div style={styles(isMobile).fakeBody}>
            <div style={styles(isMobile).fakeQuestionCard}>
              <div style={{ ...styles(isMobile).fakeLine, width: "85%", height: 24 }} />
              <div style={{ height: 30 }} />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles(isMobile).fakeOption}>
                  <div style={styles(isMobile).fakeRadio} />
                  <div style={{ ...styles(isMobile).fakeLine, flex: 1 }} />
                </div>
              ))}
              <div style={{ height: 30 }} />
              <div style={styles(isMobile).fakeButtons}>
                <div style={styles(isMobile).fakeButton} />
                <div style={styles(isMobile).fakeButton} />
              </div>
            </div>
            <div style={styles(isMobile).fakeSidebar}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={styles(isMobile).fakePalette} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingQuestions || !quizReady) {
    return renderLoading("Loading Questions...", "Please wait");
  }

  if (questionsError) {
    return (
      <div style={styles(isMobile).loadingOverlay}>
        <h2 style={{ color: "#dc2626" }}>⚠️ Error loading questions</h2>
        <p style={{ color: "#000" }}>{questionsError}</p>
        <button
          className="btn"
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.5rem",
            backgroundColor: "#0066b3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (submitting) {
    return renderLoading(disqualified ? "Disqualified" : "Calculating your rank...", "Please wait");
  }

  if (!questions.length) {
    return (
      <div style={styles(isMobile).loadingOverlay}>
        <h2 style={{ color: "#000" }}>No questions available</h2>
        <button
          className="btn"
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.5rem",
            backgroundColor: "#0066b3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const q = questions[current];
  if (!q) {
    return renderLoading("Preparing Exam...", null);
  }

  const attemptedCount = answers.filter((a) => a !== null).length;
  const totalQuestions = questions.length;
  const progress = ((current + 1) / totalQuestions) * 100;

  const custom = student?.customData || {};
  const displayName = custom.name || custom.email || student?.regNo || "Student";

  // ----- Main quiz UI (mobile-optimised) -----
  const s = styles(isMobile);

  return (
    <div style={s.page}>
      {/* Top Bar */}
      <div style={s.topBar}>
        <div style={s.profileSection}>
          <span style={s.profileEmoji}>👤</span>
          <div style={s.profileDetails}>
            <strong style={{ color: "#000" }}>{displayName}</strong>
            <span style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "#000" }}>
              {student?.regNo}
              {custom.email && ` • ${custom.email}`}
            </span>
          </div>
        </div>
        <div style={s.timerSection}>
          <span style={s.timerEmoji}>⏳</span>
          <span style={{ ...s.timerText, color: timeLeft <= 60 ? "#dc2626" : "#000" }}>
            {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <button
          onClick={() => submitQuiz(false)}
          disabled={submitted || timeLeft === 0}
          style={s.submitBtn}
        >
          Submit Quiz
        </button>
      </div>

      {/* Progress Bar */}
      <div style={s.progressBarContainer}>
        <div style={{ ...s.progressBar, width: `${progress}%` }} />
      </div>

      <div style={s.bodyRow}>
        {/* Main Content */}
        <div style={s.mainContent}>
          <h3 style={{ marginTop: 0, color: "#000", fontSize: isMobile ? "1rem" : "1.25rem" }}>
            Question {current + 1} of {totalQuestions}
          </h3>

          <p style={s.questionText}>{q.question}</p>

          {q.imageUrl && (
            <img
              src={`${API_BASE}${q.imageUrl}`}
              alt="Question illustration"
              style={s.questionImage}
            />
          )}

          <div style={s.optionsContainer}>
            {Object.entries(q.options).map(([key, val]) => {
              const isSelected = answers[current] === key;
              return (
                <label
                  key={key}
                  style={{
                    ...s.optionLabel,
                    backgroundColor: isSelected ? "#e6f0fa" : "#ffffff",
                    borderColor: isSelected ? "#0066b3" : "#d1d5db",
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${current}`}
                    value={key}
                    checked={isSelected}
                    onChange={() => selectAnswer(key)}
                    style={s.radioInput}
                  />
                  <span style={s.radioControl}>
                    <span style={isSelected ? s.radioDotActive : s.radioDot} />
                  </span>
                  <span style={s.optionText}>
                    <b style={{ color: "#000" }}>{key}.</b> <span style={{ color: "#000" }}>{val}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div style={s.navRow}>
            <button
              style={s.navBtn}
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
            >
              ← Previous
            </button>
            <button style={s.clearBtn} onClick={clearAnswer}>
              Clear Answer
            </button>
            <button
              style={s.navBtn}
              onClick={() => goTo(current + 1)}
              disabled={current === questions.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Sidebar - becomes horizontal on mobile */}
        <div style={s.sidebar}>
          <h4 style={{ marginTop: 0, marginBottom: "0.5rem", color: "#000", fontSize: isMobile ? "0.9rem" : "1rem" }}>
            Question Palette
          </h4>
          <div style={s.paletteGrid}>
            {questions.map((_, idx) => {
              const isAttempted = answers[idx] !== null;
              const isCurrent = idx === current;

              let bg, color;
              if (isAttempted) {
                bg = "#22c55e";
                color = "#fff";
              } else {
                bg = "#f3f4f6";
                color = "#000";
              }

              return (
                <div
                  key={idx}
                  onClick={() => goTo(idx)}
                  style={{
                    ...s.paletteItem,
                    backgroundColor: bg,
                    color: color,
                    border: isCurrent ? "3px solid #0066b3" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
          <div style={s.sidebarFooter}>
            <div style={{ color: "#000" }}>
              <span style={{ ...s.dot, background: "#22c55e" }} /> Attempted: {attemptedCount}
            </div>
            <div style={{ color: "#000" }}>
              <span
                style={{ ...s.dot, background: "#f3f4f6", border: "1px solid #d1d5db" }}
              />{" "}
              Unattempted: {totalQuestions - attemptedCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Styles (mobile-aware) ----------
const styles = (isMobile) => ({
  waitContainer: {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  warningCard: {
    backgroundColor: "#ffffff",
    padding: isMobile ? "1.5rem 1rem" : "2.5rem 3rem",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    maxWidth: 450,
    width: "100%",
  },
  countdown: {
    fontSize: isMobile ? 36 : 48,
    fontWeight: "bold",
    margin: "15px 0",
    letterSpacing: 2,
  },
  blurredQuiz: {
    filter: "blur(6px)",
    opacity: 0.5,
    pointerEvents: "none",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  page: {
    fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isMobile ? "0.5rem 1rem" : "0.75rem 2rem",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flex: isMobile ? "1 1 100%" : "0 1 auto",
    order: isMobile ? 1 : 0,
  },
  profileEmoji: { fontSize: isMobile ? "1.2rem" : "1.4rem" },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
    fontSize: isMobile ? "0.8rem" : "0.95rem",
    color: "#000",
  },
  timerSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#f1f5f9",
    padding: "0.2rem 0.8rem",
    borderRadius: "30px",
    border: "1px solid #e5e7eb",
    order: isMobile ? 2 : 0,
    flex: isMobile ? "0 1 auto" : "0 0 auto",
  },
  timerEmoji: { fontSize: isMobile ? "1rem" : "1.2rem" },
  timerText: {
    fontSize: isMobile ? "1rem" : "1.2rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    color: "#000",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isMobile ? "0.3rem 0.8rem" : "0.3rem 1.2rem",
    fontSize: isMobile ? "0.8rem" : "0.9rem",
    fontWeight: 600,
    backgroundColor: "#0066b3",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0, 102, 179, 0.25)",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
    whiteSpace: "nowrap",
    order: isMobile ? 3 : 0,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#e5e7eb",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0066b3",
    transition: "width 0.3s ease",
  },
  bodyRow: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    padding: isMobile ? "0.5rem" : "1rem",
    gap: isMobile ? "0.5rem" : "1rem",
    flexDirection: isMobile ? "column" : "row",
  },
  mainContent: {
    flex: 1,
    padding: isMobile ? "0.8rem 1rem" : "1.5rem 2rem",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    minHeight: isMobile ? "60vh" : "auto",
  },
  questionText: {
    fontSize: isMobile ? "1rem" : "1.15rem",
    lineHeight: 1.6,
    margin: "0.75rem 0 0.5rem",
    color: "#000",
    fontWeight: 500,
  },
  questionImage: {
    maxWidth: "100%",
    maxHeight: isMobile ? 160 : 220,
    margin: "0.5rem 0",
    objectFit: "contain",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
    margin: "0.8rem 0 1.2rem",
  },
  optionLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.4rem 0.6rem",
    borderRadius: "8px",
    border: "2px solid #d1d5db",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: isMobile ? "0.85rem" : "0.95rem",
    color: "#000",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    width: isMobile ? "100%" : "auto",
  },
  radioInput: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: "none",
  },
  radioControl: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: isMobile ? 20 : 18,
    height: isMobile ? 20 : 18,
    borderRadius: "50%",
    border: "2px solid #9ca3af",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "transparent",
    transition: "all 0.2s",
  },
  radioDotActive: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#0066b3",
  },
  optionText: {
    flex: "0 1 auto",
    lineHeight: 1.4,
    color: "#000",
    whiteSpace: isMobile ? "normal" : "nowrap",
    wordBreak: "break-word",
  },
  navRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "1.2rem",
  },
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.4rem 1rem",
    fontSize: isMobile ? "0.75rem" : "0.85rem",
    fontWeight: 500,
    backgroundColor: "#f1f5f9",
    color: "#000",
    border: "1px solid #d1d5db",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
  },
  clearBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.4rem 1rem",
    fontSize: isMobile ? "0.75rem" : "0.85rem",
    fontWeight: 500,
    backgroundColor: "#fef3c7",
    color: "#000",
    border: "1px solid #fcd34d",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
  },
  sidebar: {
    width: isMobile ? "100%" : 220,
    maxHeight: isMobile ? 120 : "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: isMobile ? "0.6rem 0.8rem" : "1.2rem 1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    flex: isMobile ? "0 0 auto" : "0 0 auto",
  },
  paletteGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(32px, 1fr))" : "repeat(4, 1fr)",
    gap: isMobile ? "0.3rem" : "0.5rem",
    margin: "0.3rem 0 0.6rem",
    overflowX: isMobile ? "auto" : "visible",
    gridAutoFlow: isMobile ? "column" : "row",
    gridTemplateRows: isMobile ? "auto" : "auto",
    paddingBottom: isMobile ? "0.3rem" : 0,
  },
  paletteItem: {
    width: isMobile ? 32 : 40,
    height: isMobile ? 32 : 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: isMobile ? "0.7rem" : "0.85rem",
    margin: "0 auto",
    transition: "all 0.15s ease",
    color: "#000",
    flexShrink: 0,
  },
  sidebarFooter: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "0.5rem",
    fontSize: isMobile ? "0.7rem" : "0.85rem",
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    justifyContent: "space-around",
    gap: isMobile ? "0.2rem" : "0.4rem",
    color: "#000",
    flexWrap: "wrap",
  },
  dot: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: 4,
  },
  loadingOverlay: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif",
    backgroundColor: "#f8fafc",
    padding: "1rem",
  },
  // blurred placeholders
  fakeHeader: {
    height: isMobile ? 60 : 70,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: isMobile ? "0 15px" : "0 30px",
    borderBottom: "1px solid #ddd",
  },
  fakeLogo: {
    width: isMobile ? 120 : 180,
    height: isMobile ? 20 : 28,
    borderRadius: 6,
    background: "#d8dce6",
  },
  fakeStudent: {
    width: isMobile ? 140 : 250,
  },
  fakeTimer: {
    width: isMobile ? 60 : 80,
    height: isMobile ? 30 : 40,
    borderRadius: 8,
    background: "#d8dce6",
  },
  fakeBody: {
    display: isMobile ? "flex" : "flex",
    flexDirection: isMobile ? "column" : "row",
    padding: isMobile ? 15 : 30,
    gap: isMobile ? 15 : 30,
  },
  fakeQuestionCard: {
    flex: 1,
    background: "#fff",
    borderRadius: 14,
    padding: isMobile ? 20 : 30,
    boxShadow: "0 8px 30px rgba(0,0,0,.08)",
  },
  fakeSidebar: {
    width: isMobile ? "100%" : 240,
    background: "#fff",
    borderRadius: 14,
    padding: isMobile ? 15 : 20,
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(30px, 1fr))" : "repeat(5, 1fr)",
    gap: isMobile ? 8 : 12,
  },
  fakePalette: {
    width: isMobile ? 30 : 36,
    height: isMobile ? 30 : 36,
    borderRadius: 6,
    background: "#d8dce6",
  },
  fakeLine: {
    height: isMobile ? 14 : 18,
    background: "#d8dce6",
    borderRadius: 10,
  },
  fakeOption: {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 10 : 15,
    marginBottom: isMobile ? 12 : 18,
  },
  fakeRadio: {
    width: isMobile ? 16 : 20,
    height: isMobile ? 16 : 20,
    borderRadius: "50%",
    background: "#d8dce6",
  },
  fakeButtons: {
    display: "flex",
    justifyContent: "space-between",
  },
  fakeButton: {
    width: isMobile ? 80 : 120,
    height: isMobile ? 32 : 42,
    borderRadius: 8,
    background: "#d8dce6",
  },
});

// Inject spinner animation globally
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default QuizPage;
