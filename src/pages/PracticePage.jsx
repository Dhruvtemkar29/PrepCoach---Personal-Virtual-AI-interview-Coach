
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  AutoAwesome,
  UploadFile,
  Description,
  Close,
  Mic,
  Stop,
  Send,
  CheckCircle,
  ContentCopy,
  Refresh,
  ArrowBack,
  Timer,
  Psychology,
  TrendingUp,
  Lightbulb,
  Warning,
} from "@mui/icons-material";
import ThemeToggle from "../components/common/ThemeToggle";

const questions = [
  "Tell me about a challenging project you worked on and how you solved the problems you encountered.",
  "How would you optimize the performance of a large React application?",
  "What causes unnecessary re-renders in React and how would you prevent them?",
  "Describe a time you disagreed with a teammate. How did you handle it?",
  "Walk me through your approach to debugging a production issue.",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Tell me about a time you had to learn a new technology quickly.",
  "Where do you see yourself in five years?",
];

const metrics = [
  { label: "Technical", value: 90 },
  { label: "Communication", value: 85 },
  { label: "Relevance", value: 82 },
  { label: "Confidence", value: 78 },
];

const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-color)",
};

function SectionLabel({ children }) {
  return (
    <p className="mb-3 font-mono text-xs tracking-widest text-[var(--accent)]">
      {children}
    </p>
  );
}

function ProgressRing({ score }) {
  return (
    <div
      className="grid h-40 w-40 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--accent) ${score * 3.6}deg, var(--bg-elevated) 0deg)`,
      }}
    >
      <div
        className="grid h-[132px] w-[132px] place-items-center rounded-full"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="text-center">
          <p className="font-sora text-4xl font-extrabold">{score}%</p>
          <p className="text-xs text-[var(--text-muted)]">Overall score</p>
        </div>
      </div>
    </div>
  );
}

function RadarChart() {
  const values = [90, 85, 82, 78];
  const labels = ["TECH", "COMM", "REL", "CONF"];
  const center = 150;
  const radius = 90;

  const points = values.map((value, i) => {
    const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
    const r = (value / 100) * radius;
    return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-sm">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={values.map((_, i) => {
            const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
            return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
          }).join(" ")}
          fill="none"
          stroke="var(--border-color)"
        />
      ))}
      {values.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="var(--border-color)"
          />
        );
      })}
      <polygon
        points={points}
        fill="var(--accent)"
        fillOpacity="0.18"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      {labels.map((label, i) => {
        const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
        return (
          <text
            key={label}
            x={center + Math.cos(angle) * 116}
            y={center + Math.sin(angle) * 116}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-secondary)"
            fontSize="10"
            fontWeight="600"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export default function PracticePage() {
  const [screen, setScreen] = useState("setup");
  const [role, setRole] = useState(
    () => localStorage.getItem("pc_role") || "Software Developer"
  );
  const [type, setType] = useState(
    () => localStorage.getItem("pc_type") || "Technical"
  );
  const [name, setName] = useState(
    () => localStorage.getItem("pc_name") || ""
  );
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [answers, setAnswers] = useState([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [toast, setToast] = useState("");
  const [score, setScore] = useState(
    () => Number(localStorage.getItem("pc_lastScore")) || 0
  );

  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const timerRef = useRef(null);

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  useEffect(() => {
    localStorage.setItem("pc_role", role);
    localStorage.setItem("pc_type", type);
    localStorage.setItem("pc_name", name);
  }, [role, type, name]);

  useEffect(() => {
    if (screen !== "interview") return;

    timerRef.current = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [screen]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const secs = String(time % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    const allowed = ["pdf", "docx", "doc", "txt"];

    if (!allowed.includes(extension)) {
      notify("Please upload a PDF, DOCX or TXT file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      notify("File size must be below 5 MB.");
      return;
    }

    setFile(selectedFile);
    notify("Resume uploaded successfully.");
  };

  const startInterview = () => {
    if (!role.trim()) {
      notify("Please enter your target role.");
      return;
    }

    setQuestionIndex(0);
    setAnswers([]);
    setTranscript("");
    transcriptRef.current = "";
    setSeconds(0);
    setScreen("interview");
  };

  const startRecording = () => {
    if (!SpeechRecognition) {
      notify("Speech recognition is not supported in this browser.");
      return;
    }

    if (recording) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text + " ";
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        transcriptRef.current += finalText;
      }

      setTranscript(transcriptRef.current + interimText);
    };

    recognition.onerror = (event) => {
      setRecording(false);
      if (event.error === "not-allowed") {
        notify("Please allow microphone access.");
      }
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    transcriptRef.current = "";
    setTranscript("");
    setRecording(true);

    try {
      recognition.start();
    } catch {
      setRecording(false);
      notify("Unable to start microphone.");
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const submitAnswer = () => {
    if (recording) stopRecording();

    const updatedAnswers = [
      ...answers,
      transcript.trim() || "No spoken answer provided.",
    ];

    setAnswers(updatedAnswers);
    transcriptRef.current = "";
    setTranscript("");

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
    } else {
      clearInterval(timerRef.current);

      // Demonstration score only — connect the ML evaluation API for real scoring.
      const demoScore = 87;
      setScore(demoScore);
      localStorage.setItem("pc_lastScore", String(demoScore));
      setScreen("results");
    }
  };

  const practiceAgain = () => {
    recognitionRef.current?.abort();
    setRecording(false);
    setQuestionIndex(0);
    setTranscript("");
    transcriptRef.current = "";
    setAnswers([]);
    setSeconds(0);
    setScreen("setup");
  };

  const copyFeedback = async () => {
    const feedback = `PrepCoach Practice Report
Overall Score: ${score}%
Technical: 90%
Communication: 85%
Relevance: 82%
Confidence: 78%

Strengths:
- Strong technical understanding
- Clear explanation of concepts

Areas to improve:
- Add more real-world examples
- Reduce filler words

Recommended next step:
Practice system-design questions with structured explanations.`;

    try {
      await navigator.clipboard.writeText(feedback);
      notify("Feedback copied successfully.");
    } catch {
      notify("Clipboard access is unavailable.");
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("pc_lastScore");
    setScore(0);
    notify("Previous score cleared.");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Navigation */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--bg-primary) 88%, transparent)",
          borderColor: "var(--border-color)",
        }}
      >
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-red-800 text-white shadow-lg">
              <AutoAwesome />
            </div>
            <span className="font-sora text-lg font-bold">
              Prep<span className="text-[var(--accent)]">Coach</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)] sm:block"
            >
              <ArrowBack fontSize="small" /> Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <AnimatePresence mode="wait">
          {/* ================= SETUP ================= */}
          {screen === "setup" && (
            <motion.section
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="mx-auto max-w-3xl"
            >
              {score > 0 && (
                <div
                  className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
                  style={cardStyle}
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Welcome back{name ? `, ${name}` : ""}!
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Your previous practice score:{" "}
                      <span className="font-bold text-[var(--accent)]">
                        {score}%
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
                  >
                    Clear history
                  </button>
                </div>
              )}

              <div className="mb-12 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2 text-xs font-semibold tracking-widest text-[var(--accent)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
                  INTERVIEW SESSION SETUP
                </span>

                <h1 className="mt-6 font-sora text-4xl font-extrabold leading-tight sm:text-5xl">
                  Let's prepare you for your
                  <br />
                  <span className="gradient-text">next interview.</span>
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-[var(--text-secondary)]">
                  Practice with ARIA, answer interview questions and discover
                  opportunities to improve.
                </p>
              </div>

              {/* Name */}
              <div className="mb-7">
                <SectionLabel>// YOUR NAME</SectionLabel>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border bg-transparent px-5 py-4 outline-none transition focus:border-[var(--accent)]"
                  style={{ borderColor: "var(--border-color)" }}
                />
              </div>

              {/* Resume */}
              <div className="mb-8">
                <SectionLabel>// STEP 01 — UPLOAD RESUME</SectionLabel>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-3xl border-2 border-dashed p-9 text-center transition-all sm:p-12"
                  style={{
                    borderColor: dragging ? "var(--accent)" : "var(--border-color)",
                    background: dragging
                      ? "color-mix(in srgb, var(--accent) 8%, var(--bg-card))"
                      : "var(--bg-card)",
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />

                  {file ? (
                    <>
                      <CheckCircle
                        sx={{ fontSize: 48, color: "#10B981" }}
                      />
                      <h3 className="mt-4 font-sora font-bold">
                        Resume uploaded
                      </h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="mt-4 text-sm text-[var(--accent)]"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                        <UploadFile sx={{ fontSize: 32 }} />
                      </div>
                      <h3 className="mt-5 font-sora text-xl font-bold">
                        Drag & drop your resume
                      </h3>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        PDF, DOCX or TXT · Maximum 5 MB
                      </p>
                      <span className="mt-5 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white">
                        Browse Files
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Role and type */}
              <div className="mb-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <SectionLabel>// STEP 02 — TARGET ROLE</SectionLabel>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Developer"
                    className="w-full rounded-2xl border bg-[var(--bg-card)] px-5 py-4 outline-none focus:border-[var(--accent)]"
                    style={{ borderColor: "var(--border-color)" }}
                  />
                </div>

                <div>
                  <SectionLabel>// STEP 03 — INTERVIEW TYPE</SectionLabel>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-2xl border bg-[var(--bg-card)] px-5 py-4 outline-none focus:border-[var(--accent)]"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <option>Technical</option>
                    <option>Behavioral</option>
                    <option>System Design</option>
                    <option>HR / Culture Fit</option>
                  </select>
                </div>
              </div>

              <button
                onClick={startInterview}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-red-500 to-red-800 px-8 py-5 font-mono text-sm font-bold tracking-widest text-white shadow-lg transition hover:-translate-y-1 hover:shadow-red-500/20"
              >
                START INTERVIEW <span>→</span>
              </button>

              <p className="mt-4 text-center font-mono text-xs text-[var(--text-muted)]">
                APPROX. 10 MIN · 8 QUESTIONS · PRACTICE SESSION
              </p>
            </motion.section>
          )}

          {/* ================= INTERVIEW ================= */}
          {screen === "interview" && (
            <motion.section
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Session header */}
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Psychology />
                  </div>
                  <div>
                    <SectionLabel>LIVE INTERVIEW SESSION</SectionLabel>
                    <h2 className="font-sora font-bold">
                      {role} · {type}
                    </h2>
                  </div>
                </div>

                <div className="flex gap-7">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">QUESTION</p>
                    <p className="font-sora text-lg font-bold">
                      {questionIndex + 1} / {questions.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">TIME</p>
                    <p className="font-sora text-lg font-bold text-[var(--accent)]">
                      {formatTime(seconds)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent)]"
                  animate={{
                    width: `${((questionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <div className="grid gap-7 lg:grid-cols-[0.85fr_1.4fr]">
                {/* ARIA */}
                <div
                  className="relative flex min-h-[390px] flex-col items-center justify-center overflow-hidden rounded-3xl p-8"
                  style={cardStyle}
                >
                  <div className="absolute inset-0 grid-background opacity-50" />

                  <div className="relative grid h-44 w-44 place-items-center rounded-full border border-[var(--accent)]/20">
                    <div className="absolute inset-4 animate-spin rounded-full border border-dashed border-[var(--accent)]/30" />
                    <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-red-500/20 to-red-900/30 shadow-[0_0_50px_rgba(255,46,46,0.15)]">
                      <AutoAwesome
                        sx={{ fontSize: 54, color: "var(--accent)" }}
                      />
                    </div>
                  </div>

                  <div className="relative mt-8 text-center">
                    <h3 className="font-sora text-2xl font-bold">ARIA</h3>
                    <p className="mt-1 font-mono text-xs tracking-widest text-[var(--accent)]">
                      AI INTERVIEWER
                    </p>
                    <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      {recording ? "LISTENING TO YOUR ANSWER" : "READY"}
                    </p>
                  </div>
                </div>

                {/* Question and transcript */}
                <div className="space-y-6">
                  <div className="rounded-3xl p-7" style={cardStyle}>
                    <SectionLabel>ARIA ASKS</SectionLabel>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={questionIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-sora text-xl leading-9"
                      >
                        {questions[questionIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <div
                    className="min-h-[210px] rounded-3xl p-7"
                    style={cardStyle}
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${recording ? "animate-pulse bg-red-500" : "bg-[var(--text-muted)]"}`}
                      />
                      <span className="font-mono text-xs tracking-widest text-[var(--accent)]">
                        {recording ? "RECORDING..." : "YOUR TRANSCRIPT"}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                      {transcript || "Your spoken answer will appear here..."}
                    </p>

                    {recording && (
                      <div className="mt-5 flex h-7 items-center justify-center gap-1">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className="w-1 rounded-full bg-[var(--accent)]"
                            animate={{ height: [5, 12 + (i % 5) * 4, 5] }}
                            transition={{
                              duration: 0.5 + (i % 3) * 0.2,
                              repeat: Infinity,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={startRecording}
                      disabled={recording}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-800 px-5 py-4 font-mono text-sm font-bold text-white disabled:opacity-50"
                    >
                      <Mic /> SPEAK
                    </button>

                    <button
                      onClick={stopRecording}
                      disabled={!recording}
                      className="flex items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-semibold disabled:opacity-40"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <Stop /> STOP
                    </button>

                    <button
                      onClick={submitAnswer}
                      className="flex items-center justify-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-6 py-4 text-sm font-bold text-[var(--accent)]"
                    >
                      <Send /> SUBMIT
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-[var(--text-muted)]">
                Your microphone audio is processed by your browser's speech
                recognition feature. You can also submit an empty answer to
                continue.
              </p>
            </motion.section>
          )}

          {/* ================= RESULTS ================= */}
          {screen === "results" && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-xs font-bold tracking-widest text-green-500">
                  <CheckCircle fontSize="small" /> SESSION COMPLETED
                </span>
                <h1 className="mt-5 font-sora text-4xl font-extrabold">
                  Your performance report
                </h1>
                <p className="mt-3 text-[var(--text-secondary)]">
                  Here's a summary of your practice session for {role}.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div
                  className="flex flex-col items-center justify-center rounded-3xl p-8"
                  style={cardStyle}
                >
                  <SectionLabel>OVERALL PERFORMANCE</SectionLabel>
                  <ProgressRing score={score} />
                  <p className="mt-6 font-sora text-xl font-bold">
                    Great effort!
                  </p>
                  <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                    You completed all {questions.length} questions in{" "}
                    {formatTime(seconds)}.
                  </p>
                </div>

                <div className="rounded-3xl p-8" style={cardStyle}>
                  <SectionLabel>SKILL BREAKDOWN</SectionLabel>
                  <div className="space-y-7">
                    {metrics.map((metric) => (
                      <div key={metric.label}>
                        <div className="mb-3 flex justify-between text-sm">
                          <span className="font-semibold">
                            {metric.label}
                          </span>
                          <span className="font-mono text-[var(--accent)]">
                            {metric.value}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1 }}
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 border-t border-[var(--border-color)] pt-5">
                    <SectionLabel>PERFORMANCE RADAR</SectionLabel>
                    <RadarChart />
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="rounded-3xl p-8" style={cardStyle}>
                <SectionLabel>YOUR FEEDBACK</SectionLabel>
                <h2 className="mb-6 font-sora text-2xl font-bold">
                  Strengths & improvement areas
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl bg-green-500/5 p-5">
                    <div className="mb-4 flex items-center gap-2 text-green-500">
                      <TrendingUp />
                      <h3 className="font-bold">Your strengths</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                      <li>✓ Strong technical understanding</li>
                      <li>✓ Clear explanation of concepts</li>
                      <li>✓ Good problem-solving approach</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-amber-500/5 p-5">
                    <div className="mb-4 flex items-center gap-2 text-amber-500">
                      <Warning />
                      <h3 className="font-bold">Areas to improve</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                      <li>• Add more real-world examples</li>
                      <li>• Improve answer structure</li>
                      <li>• Reduce unnecessary filler words</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5">
                  <div className="mb-2 flex items-center gap-2 text-[var(--accent)]">
                    <Lightbulb />
                    <span className="font-mono text-xs font-bold tracking-widest">
                      RECOMMENDED NEXT STEP
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">
                    Practice system-design questions and focus on structured
                    explanations supported by practical examples.
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={copyFeedback}
                    className="flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-6 py-3 text-sm font-bold text-[var(--accent)]"
                  >
                    <ContentCopy fontSize="small" /> COPY FEEDBACK
                  </button>

                  <button
                    onClick={practiceAgain}
                    className="flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <Refresh fontSize="small" /> PRACTICE AGAIN
                  </button>
                </div>
              </div>

              {/* Improvement plan */}
              <div className="rounded-3xl p-8" style={cardStyle}>
                <SectionLabel>YOUR IMPROVEMENT PLAN</SectionLabel>
                <h2 className="mb-6 font-sora text-2xl font-bold">
                  Keep getting better.
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Improve technical depth",
                    "Strengthen communication",
                    "Build interview confidence",
                    "Practice structured answers",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] p-4"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-[var(--text-muted)]">
                Demonstration report: scores and feedback are currently sample
                values. Connect the evaluation backend for actual personalized
                analysis.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-4 text-sm shadow-xl"
          >
            <CheckCircle className="mr-2 text-green-500" fontSize="small" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
