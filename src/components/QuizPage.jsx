import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "https://quizappbackend-xngu.onrender.com";

// ---------- Utility: Fisher–Yates shuffle ----------
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function QuizPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const student = state?.student;
  const examStartTime = state?.examStartTime ? new Date(state.examStartTime) : null;
  const examDuration = state?.examDuration || 30;

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
  const [isLandscape, setIsLandscape] = useState(true);

  const timerRef = useRef(null);
  const autoSubmitted = useRef(false);
  const submitQuizRef = useRef(null);
  const timerInitialized = useRef(false);

  // Redirect if no student
  useEffect(() => {
    if (!student) navigate("/login");
  }, [student, navigate]);

  // Check disqualification
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

  // ---------- Orientation enforcement ----------
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeNow =
        window.matchMedia("(orientation: landscape)").matches ||
        (window.screen?.orientation?.type?.startsWith("landscape") ?? false) ||
        window.innerWidth > window.innerHeight;

      setIsLandscape(isLandscapeNow);
    };

    checkOrientation();

    const handleChange = () => checkOrientation();

    window.addEventListener("orientationchange", handleChange);
    window.addEventListener("resize", handleChange);

    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", handleChange);
    }

    return () => {
      window.removeEventListener("orientationchange", handleChange);
      window.removeEventListener("resize", handleChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", handleChange);
      }
    };
  }, []);

  // ---------- Quiz status polling ----------
  useEffect(() => {
    if (quizActive || !student) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/quiz-status`);
        const data = await res.json();

        if (data.isQuizOpen) {
          // Only set timeLeft once from server's endTime
          if (!timerInitialized.current) {
            const end = new Date(data.endTime);
            const now = new Date();
            let remaining = Math.floor((end - now) / 1000);
            if (remaining < 0) remaining = 0;
            setTimeLeft(remaining);
            timerInitialized.current = true;
          }
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

  // ---------- Fetch questions ----------
  useEffect(() => {
    if (!quizActive) return;

    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setQuizReady(false);
      setQuestionsError(null);

      try {
        await fetch(`${API_BASE}/start-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regNo: student.regNo }),
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

  // ---------- Submit quiz (with auto flag) ----------
  const submitQuiz = useCallback(
    async (auto = false) => {
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
          body: JSON.stringify({
            regNo: student.regNo,
            answers: originalAnswers,
            auto: auto,
          }),
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
    },
    [questions, answers, student, navigate, submitted]
  );

  // Keep ref updated
  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  // ---------- Auto-submit on timer end ----------
  const handleTimeExpired = useCallback(() => {
    if (autoSubmitted.current) return;
    autoSubmitted.current = true;
    if (submitQuizRef.current) {
      submitQuizRef.current(true); // auto = true
    }
  }, []);

  // ---------- Timer effect ----------
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
  }, [quizActive, submitted, questions.length, disqualified, handleTimeExpired]);

  // ---------- Auto-submit when timeLeft becomes 0 (e.g., set initially to 0) ----------
  useEffect(() => {
    if (quizActive && quizReady && !submitted && timeLeft === 0 && !disqualified) {
      handleTimeExpired();
    }
  }, [timeLeft, quizActive, quizReady, submitted, disqualified, handleTimeExpired]);

  // ---------- Determine mobile ----------
  const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);

  // ---------- Landscape overlay (mandatory) ----------
  if (isMobile && !isLandscape) {
    return (
      <div style={styles.landscapeOverlay}>
        <div style={styles.landscapeContent}>
          <div style={styles.rotateIcon}>📱↻</div>
          <h2 style={{ color: "#000" }}>Please rotate your device</h2>
          <p style={{ color: "#000" }}>This quiz must be taken in <strong>landscape</strong> mode.</p>
          <p style={{ color: "#000", fontSize: "0.9rem" }}>
            Turn your phone sideways to continue.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Disqualified ----------
  if (disqualified) {
    return (
      <div style={styles.waitContainer}>
        <div style={styles.overlay}>
          <div style={{ ...styles.warningCard, border: "3px solid #dc2626" }}>
            <h2 style={{ color: "#dc2626" }}>⛔ {disqualifiedMessage || "You have been disqualified"}</h2>
            <p style={{ color: "#000" }}>You cannot continue with this quiz.</p>
            <button onClick={() => navigate("/login")} style={styles.submitBtn}>
              Go to Login
            </button>
          </div>
        </div>
        <div style={styles.blurredQuiz}>
          <div style={styles.fakeHeader}>
            <div style={styles.fakeLogo}></div>
            <div style={styles.fakeStudent}>
              <div style={styles.fakeLine}></div>
              <div style={{ ...styles.fakeLine, width: "70%" }}></div>
            </div>
            <div style={styles.fakeTimer}></div>
          </div>
          <div style={styles.fakeBody}>
            <div style={styles.fakeQuestionCard}>
              <div style={{ ...styles.fakeLine, width: "85%", height: 24 }}></div>
              <div style={{ height: 30 }} />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles.fakeOption}>
                  <div style={styles.fakeRadio}></div>
                  <div style={{ ...styles.fakeLine, flex: 1 }}></div>
                </div>
              ))}
              <div style={{ height: 30 }} />
              <div style={styles.fakeButtons}>
                <div style={styles.fakeButton}></div>
                <div style={styles.fakeButton}></div>
              </div>
            </div>
            <div style={styles.fakeSidebar}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={styles.fakePalette}></div>
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
      <div style={styles.waitContainer}>
        <div style={styles.overlay}>
          <div style={styles.warningCard}>
            <h2 style={{ color: "#000" }}>🔒 Exam not started yet</h2>
            <p style={{ color: "#000" }}>
              Scheduled start at <strong>{startTimeStr}</strong> IST
            </p>
            <div style={{ ...styles.countdown, color: "#0066b3" }}>
              {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
            </div>
            <p style={{ color: "#000" }}>
              The page will refresh automatically when the exam begins.
            </p>
          </div>
        </div>
        <div style={styles.blurredQuiz}>
          <div style={styles.fakeHeader}>
            <div style={styles.fakeLogo}></div>
            <div style={styles.fakeStudent}>
              <div style={styles.fakeLine}></div>
              <div style={{ ...styles.fakeLine, width: "70%" }}></div>
            </div>
            <div style={styles.fakeTimer}></div>
          </div>
          <div style={styles.fakeBody}>
            <div style={styles.fakeQuestionCard}>
              <div style={{ ...styles.fakeLine, width: "85%", height: 24 }}></div>
              <div style={{ height: 30 }} />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles.fakeOption}>
                  <div style={styles.fakeRadio}></div>
                  <div style={{ ...styles.fakeLine, flex: 1 }}></div>
                </div>
              ))}
              <div style={{ height: 30 }} />
              <div style={styles.fakeButtons}>
                <div style={styles.fakeButton}></div>
                <div style={styles.fakeButton}></div>
              </div>
            </div>
            <div style={styles.fakeSidebar}>
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} style={styles.fakePalette}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Loading / error / submitting ----------
  if (loadingQuestions || !quizReady) {
    return (
      <div style={styles.loadingOverlay}>
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
        <h2 style={{ color: "#000" }}>Loading Questions...</h2>
        <p style={{ color: "#000" }}>Please wait</p>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div style={styles.loadingOverlay}>
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
    return (
      <div style={styles.loadingOverlay}>
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
        <h2 style={{ color: "#000" }}>{disqualified ? "Disqualified" : "Calculating your rank..."}</h2>
        <p style={{ color: "#000" }}>Please wait</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={styles.loadingOverlay}>
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
    return (
      <div style={styles.loadingOverlay}>
        <div className="spinner" />
        <h2>Preparing Exam...</h2>
      </div>
    );
  }

  const attemptedCount = answers.filter((a) => a !== null).length;
  const totalQuestions = questions.length;
  const progress = ((current + 1) / totalQuestions) * 100;

  const custom = student?.customData || {};
  const displayName = custom.name || custom.email || student?.regNo || "Student";

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.profileSection}>
          <span style={styles.profileEmoji}>👤</span>
          <div style={styles.profileDetails}>
            <strong style={{ color: "#000" }}>{displayName}</strong>
            <span style={{ fontSize: "0.8rem", color: "#000" }}>
              {student?.regNo}
              {custom.email && ` • ${custom.email}`}
            </span>
          </div>
        </div>
        <div style={styles.timerSection}>
          <span style={styles.timerEmoji}>⏳</span>
          <span style={{ ...styles.timerText, color: timeLeft <= 60 ? "#dc2626" : "#000" }}>
            {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <button
          onClick={() => submitQuiz(false)}
          disabled={submitted || timeLeft === 0}
          style={styles.submitBtn}
        >
          Submit Quiz
        </button>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBarContainer}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>

      <div style={styles.bodyRow}>
        {/* Main Content */}
        <div style={styles.mainContent}>
          <h3 style={{ marginTop: 0, color: "#000" }}>
            Question {current + 1} of {totalQuestions}
          </h3>

          <p style={styles.questionText}>{q.question}</p>

          {q.imageUrl && (
            <img
              src={`${API_BASE}${q.imageUrl}`}
              alt="Question illustration"
              style={styles.questionImage}
            />
          )}

          <div style={styles.optionsContainer}>
            {Object.entries(q.options).map(([key, val]) => {
              const isSelected = answers[current] === key;
              return (
                <label
                  key={key}
                  style={{
                    ...styles.optionLabel,
                    backgroundColor: isSelected ? "#e6f0fa" : "#ffffff",
                    borderColor: isSelected ? "#0066b3" : "#d1d5db",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${current}`}
                    value={key}
                    checked={isSelected}
                    onChange={() => selectAnswer(key)}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioControl}>
                    <span style={isSelected ? styles.radioDotActive : styles.radioDot} />
                  </span>
                  <span style={styles.optionText}>
                    <b style={{ color: "#000" }}>{key}.</b> <span style={{ color: "#000" }}>{val}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div style={styles.navRow}>
            <button
              style={styles.navBtn}
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
            >
              ← Previous
            </button>
            <button style={styles.clearBtn} onClick={clearAnswer}>
              Clear Answer
            </button>
            <button
              style={styles.navBtn}
              onClick={() => goTo(current + 1)}
              disabled={current === questions.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <h4 style={{ marginTop: 0, marginBottom: "0.5rem", color: "#000" }}>
            Question Palette
          </h4>
          <div style={styles.paletteGrid}>
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
                    ...styles.paletteItem,
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
          <div style={styles.sidebarFooter}>
            <div style={{ color: "#000" }}>
              <span style={{ ...styles.dot, background: "#22c55e" }} /> Attempted: {attemptedCount}
            </div>
            <div style={{ color: "#000" }}>
              <span
                style={{ ...styles.dot, background: "#f3f4f6", border: "1px solid #d1d5db" }}
              />{" "}
              Unattempted: {totalQuestions - attemptedCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Styles ----------
const styles = {
  landscapeOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  landscapeContent: {
    textAlign: "center",
    padding: "2rem",
    maxWidth: 400,
  },
  rotateIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
    display: "inline-block",
    animation: "spin 2s linear infinite",
  },
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
  },
  warningCard: {
    backgroundColor: "#ffffff",
    padding: "2.5rem 3rem",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    maxWidth: 450,
    width: "90%",
  },
  countdown: {
    fontSize: 48,
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
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 2rem",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  profileEmoji: { fontSize: "1.4rem" },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.3,
    fontSize: "0.95rem",
    color: "#000",
  },
  timerSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#f1f5f9",
    padding: "0.3rem 1rem",
    borderRadius: "30px",
    border: "1px solid #e5e7eb",
  },
  timerEmoji: { fontSize: "1.2rem" },
  timerText: {
    fontSize: "1.2rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    color: "#000",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.3rem 1.2rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    backgroundColor: "#0066b3",
    color: "#fff",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0, 102, 179, 0.25)",
    flex: "0 0 auto",
    width: "auto",
    whiteSpace: "nowrap",
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
    padding: "1rem",
    gap: "1rem",
  },
  mainContent: {
    flex: 1,
    padding: "1.5rem 2rem",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  questionText: {
    fontSize: "1.15rem",
    lineHeight: 1.7,
    margin: "1rem 0 0.5rem",
    color: "#000",
    fontWeight: 500,
  },
  questionImage: {
    maxWidth: "100%",
    maxHeight: "220px",
    margin: "0.75rem 0",
    objectFit: "contain",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
    margin: "1rem 0 1.5rem",
  },
  optionLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    border: "2px solid #d1d5db",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: "0.95rem",
    color: "#000",
    backgroundColor: "#ffffff",
    width: "auto",
    maxWidth: "100%",
    boxSizing: "border-box",
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
    width: 18,
    height: 18,
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
    whiteSpace: "nowrap",
  },
  navRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.6rem",
    marginTop: "1.5rem",
  },
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.3rem 0.9rem",
    fontSize: "0.85rem",
    fontWeight: 500,
    backgroundColor: "#f1f5f9",
    color: "#000",
    border: "1px solid #d1d5db",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: "0 0 auto",
    width: "auto",
    whiteSpace: "nowrap",
  },
  clearBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.3rem 0.9rem",
    fontSize: "0.85rem",
    fontWeight: 500,
    backgroundColor: "#fef3c7",
    color: "#000",
    border: "1px solid #fcd34d",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: "0 0 auto",
    width: "auto",
    whiteSpace: "nowrap",
  },
  sidebar: {
    width: 220,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: "1.2rem 1rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  paletteGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.5rem",
    margin: "0.5rem 0 1rem",
  },
  paletteItem: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "0.85rem",
    margin: "0 auto",
    transition: "all 0.15s ease",
    color: "#000",
  },
  sidebarFooter: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "0.75rem",
    fontSize: "0.85rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    color: "#000",
  },
  dot: {
    display: "inline-block",
    width: 12,
    height: 12,
    borderRadius: "50%",
    marginRight: 6,
  },
  loadingOverlay: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif",
    backgroundColor: "#f8fafc",
  },
  blurredQuiz: {
    position: "absolute",
    inset: 0,
    background: "#f5f7fb",
    filter: "blur(8px)",
    transform: "scale(1.04)",
    opacity: 0.9,
    zIndex: 0,
    overflow: "hidden",
  },
  fakeHeader: {
    height: 70,
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    borderBottom: "1px solid #ddd",
  },
  fakeLogo: {
    width: 180,
    height: 28,
    borderRadius: 6,
    background: "#d8dce6",
  },
  fakeStudent: {
    width: 250,
  },
  fakeTimer: {
    width: 80,
    height: 40,
    borderRadius: 8,
    background: "#d8dce6",
  },
  fakeBody: {
    display: "flex",
    padding: 30,
    gap: 30,
  },
  fakeQuestionCard: {
    flex: 1,
    background: "#fff",
    borderRadius: 14,
    padding: 30,
    boxShadow: "0 8px 30px rgba(0,0,0,.08)",
  },
  fakeSidebar: {
    width: 240,
    background: "#fff",
    borderRadius: 14,
    padding: 20,
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: 12,
  },
  fakePalette: {
    width: 36,
    height: 36,
    borderRadius: 6,
    background: "#d8dce6",
  },
  fakeLine: {
    height: 18,
    background: "#d8dce6",
    borderRadius: 10,
  },
  fakeOption: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    marginBottom: 18,
  },
  fakeRadio: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#d8dce6",
  },
  fakeButtons: {
    display: "flex",
    justifyContent: "space-between",
  },
  fakeButton: {
    width: 120,
    height: 42,
    borderRadius: 8,
    background: "#d8dce6",
  },
};

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
