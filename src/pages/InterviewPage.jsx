import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import VoiceAnswerInput from "../components/common/VoiceAnswerInput";

import {
  AutoAwesome,
  Work,
  CloudUpload,
  Timer,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Psychology,
  RecordVoiceOver,
  RestartAlt,
  InsertDriveFile,
  Close,
  Lightbulb,
} from "@mui/icons-material";

// -----------------------------------------------------
// SAMPLE QUESTION BANK
// Replace this with backend-generated questions later.
// -----------------------------------------------------

const questionBank = {
  Technical: [
    "Tell me about your technical background and the technologies you have worked with.",
    "What is the difference between let, const and var in JavaScript?",
    "Explain how React's virtual DOM works.",
    "How would you optimize the performance of a React application?",
    "Describe a challenging technical problem you solved in a project.",
  ],

  Behavioral: [
    "Tell me about yourself and your professional journey.",
    "Describe a situation where you faced a challenging deadline.",
    "Tell me about a time you worked with a difficult team member.",
    "How do you handle constructive criticism?",
    "Describe an achievement that you are particularly proud of.",
  ],

  "System Design": [
    "How would you design a URL shortening service?",
    "How would you design a scalable notification system?",
    "Explain the role of caching in system architecture.",
    "How would you handle millions of concurrent users?",
    "How would you design a scalable file storage system?",
  ],

  "HR / Culture Fit": [
    "Tell me about yourself.",
    "Why do you want to join our organization?",
    "What are your greatest strengths and weaknesses?",
    "Where do you see yourself in the next five years?",
    "Why should we hire you?",
  ],
};

const questionTips = [
  "Keep your introduction structured. Mention your background, key skills and relevant projects.",
  "Explain the concept clearly, then support your answer with a practical example.",
  "Use a real situation and explain your actions and the outcome.",
  "Break the problem into smaller components before explaining your solution.",
  "Be specific. Focus on your contribution rather than only describing the team.",
];

const interviewTypes = [
  {
    name: "Technical",
    description: "Test your technical knowledge and problem-solving skills.",
    icon: "⌘",
    tag: "Most popular",
  },
  {
    name: "Behavioral",
    description: "Practice real-world workplace and situational questions.",
    icon: "◎",
  },
  {
    name: "System Design",
    description: "Explore architecture, scalability and design decisions.",
    icon: "▦",
  },
  {
    name: "HR / Culture Fit",
    description: "Prepare for personal, career and company-fit questions.",
    icon: "✳",
  },
];

const difficulties = [
  {
    name: "Beginner",
    description: "Fundamentals",
  },
  {
    name: "Intermediate",
    description: "Practical knowledge",
  },
  {
    name: "Advanced",
    description: "In-depth expertise",
  },
];

const durations = [5, 15, 30];

// -----------------------------------------------------
// REUSABLE COMPONENTS
// -----------------------------------------------------

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xs font-bold text-red-400">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <div
      className={`glass rounded-2xl border border-[var(--border-color)] p-5 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="primary-button flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

// -----------------------------------------------------
// 1. INTERVIEW SETUP
// -----------------------------------------------------

function SetupPage({ onStart }) {
  const [role, setRole] = useState("Frontend Developer");
  const [type, setType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState(15);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showJobDescription, setShowJobDescription] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setFileError("");

    if (!file) return;

    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileError("Please upload a PDF, DOCX or TXT file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5 MB.");
      return;
    }

    setResume(file);
  };

  const start = () => {
    if (!role.trim()) return;

    onStart({
      role: role.trim(),
      type,
      difficulty,
      duration,
      jobDescription,
      resumeName: resume?.name || null,
    });
  };

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-red-400">
            <AutoAwesome fontSize="small" />
            PREPCOACH INTERVIEW STUDIO
          </div>

          <h1 className="max-w-2xl text-2xl font-bold leading-tight md:text-4xl">
            Your next opportunity
            <span className="gradient-text"> starts with practice.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Set up a practice session that matches your career goals. Build
            confidence, improve your answers and get interview-ready.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Practice workspace ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        {/* MAIN CONFIGURATION */}

        <div className="min-w-0 space-y-6">
          {/* ROLE */}

          <Panel>
            <SectionHeading
              number="01"
              title="What role are you preparing for?"
              description="Choose the position you want to practice for."
            />

            <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
              Target job role
            </label>

            <div className="relative">
              <Work
                fontSize="small"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Frontend Developer"
                className="glass-input !h-12 !pl-11"
              />
            </div>
          </Panel>

          {/* INTERVIEW TYPE */}

          <Panel>
            <SectionHeading
              number="02"
              title="Choose your interview type"
              description="Select the kind of interview you want to simulate."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {interviewTypes.map((item) => {
                const selected = type === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setType(item.name)}
                    className={`relative rounded-2xl border p-4 text-left transition duration-200 ${selected
                        ? "border-red-500/60 bg-red-500/[0.07] shadow-[0_0_0_1px_rgba(239,68,68,0.12)]"
                        : "border-[var(--border-color)] bg-[var(--input-bg)] hover:border-red-500/30"
                      }`}
                  >
                    {item.tag && (
                      <span className="absolute right-3 top-3 rounded-full bg-red-500/10 px-2 py-1 text-[9px] font-semibold text-red-400">
                        {item.tag}
                      </span>
                    )}

                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xl ${selected
                          ? "bg-red-500 text-white"
                          : "bg-red-500/10 text-red-400"
                        }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold">{item.name}</h4>

                      {selected && (
                        <CheckCircle className="text-red-400" fontSize="small" />
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* DIFFICULTY AND DURATION */}

          <Panel>
            <SectionHeading
              number="03"
              title="Customize your session"
              description="Adjust the challenge level and session duration."
            />

            <div className="mb-6">
              <label className="mb-3 block text-xs font-medium text-[var(--text-secondary)]">
                Difficulty level
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {difficulties.map((item) => {
                  const selected = difficulty === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setDifficulty(item.name)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${selected
                          ? "border-red-500/60 bg-red-500/[0.07]"
                          : "border-[var(--border-color)] bg-[var(--input-bg)] hover:border-red-500/30"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {item.name}
                        </span>

                        {selected && (
                          <CheckCircle
                            className="text-red-400"
                            fontSize="small"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-[var(--text-secondary)]">
                Session duration
              </label>

              <div className="flex flex-wrap gap-3">
                {durations.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setDuration(minutes)}
                    className={`flex min-w-[100px] items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${duration === minutes
                        ? "border-red-500/60 bg-red-500/[0.07] text-red-400"
                        : "border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-secondary)] hover:border-red-500/30"
                      }`}
                  >
                    <Timer fontSize="small" />
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {/* RESUME */}

          <Panel>
            <SectionHeading
              number="04"
              title="Add your resume"
              description="Optionally upload your resume for resume-based interview preparation."
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />

            {resume ? (
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                    <InsertDriveFile />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {resume.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {(resume.size / 1024).toFixed(1)} KB · Ready to use
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResume(null);
                    setFileError("");
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="flex items-center gap-1 self-start text-xs text-red-400 hover:text-red-300 sm:self-center"
                >
                  <Close fontSize="small" />
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--input-bg)] px-5 py-8 text-center transition hover:border-red-500/50 hover:bg-red-500/[0.03]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 transition group-hover:scale-105">
                  <CloudUpload sx={{ fontSize: 26 }} />
                </div>

                <p className="text-sm font-semibold">
                  Click to upload your resume
                </p>

                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  PDF, DOCX or TXT · Maximum 5 MB
                </p>
              </button>
            )}

            {fileError && (
              <p className="mt-3 text-xs text-red-400">{fileError}</p>
            )}
          </Panel>

          {/* JOB DESCRIPTION */}

          <Panel>
            <button
              type="button"
              onClick={() => setShowJobDescription((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-xs font-bold text-red-400">
                    05
                  </span>
                  <h3 className="text-sm font-semibold">
                    Job description
                  </h3>
                  <span className="rounded-full bg-[var(--input-bg)] px-2 py-1 text-[9px] text-[var(--text-muted)]">
                    Optional
                  </span>
                </div>

                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Add the job description to provide additional context.
                </p>
              </div>

              <span className="text-lg text-[var(--text-muted)]">
                {showJobDescription ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence>
              {showJobDescription && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(event.target.value)
                    }
                    rows={5}
                    placeholder="Paste the job description here..."
                    className="glass-input mt-5 resize-y"
                  />

                  <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                    This information is saved in the current frontend session
                    only. Backend-based question customization can be added
                    later.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          {/* START BUTTON */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              You can review your answers before starting.
            </p>

            <PrimaryButton onClick={start} disabled={!role.trim()}>
              <AutoAwesome fontSize="small" />
              Start Interview
              <ArrowForward fontSize="small" />
            </PrimaryButton>
          </div>
        </div>

        {/* SESSION SUMMARY */}

        <aside className="space-y-5 xl:sticky xl:top-6">
          <Panel className="overflow-hidden !border-red-500/20">
            <div className="mb-5 flex items-center gap-2 text-red-400">
              <AutoAwesome fontSize="small" />
              <span className="text-xs font-bold tracking-widest">
                SESSION OVERVIEW
              </span>
            </div>

            <h3 className="text-xl font-bold leading-snug">
              Your interview,
              <br />
              your preparation.
            </h3>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Review your session settings before entering the interview.
            </p>

            <div className="my-5 h-px bg-[var(--border-color)]" />

            <div className="space-y-4">
              <SummaryItem label="Target role" value={role || "Not selected"} />
              <SummaryItem label="Interview type" value={type} />
              <SummaryItem label="Difficulty" value={difficulty} />
              <SummaryItem label="Duration" value={`${duration} minutes`} />
              <SummaryItem
                label="Resume"
                value={resume ? "Uploaded" : "Not added"}
              />
            </div>

            <div className="my-5 h-px bg-[var(--border-color)]" />

            <div className="rounded-xl bg-red-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-red-400">
                <Timer fontSize="small" />
                <span className="text-xs font-semibold">Session format</span>
              </div>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                5 sample questions with a {duration}-minute countdown. You can
                move between questions and edit your answers.
              </p>
            </div>
          </Panel>

          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="text-amber-400" fontSize="small" />
              <h4 className="text-sm font-semibold">Before you begin</h4>
            </div>

            <ul className="space-y-3 text-xs leading-5 text-[var(--text-muted)]">
              <li className="flex gap-2">
                <span className="text-red-400">•</span>
                Find a quiet place with minimal distractions.
              </li>
              <li className="flex gap-2">
                <span className="text-red-400">•</span>
                Explain your answers with practical examples.
              </li>
              <li className="flex gap-2">
                <span className="text-red-400">•</span>
                Keep track of the remaining session time.
              </li>
            </ul>
          </Panel>

          <div className="rounded-xl border border-[var(--border-color)] px-4 py-3">
            <p className="text-[10px] leading-5 text-[var(--text-muted)]">
              <strong className="text-[var(--text-secondary)]">
                Demo mode:
              </strong>{" "}
              Questions are sample questions. Live AI question generation and
              evaluation will be connected through the backend.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="max-w-[60%] truncate text-right text-xs font-semibold">
        {value}
      </span>
    </div>
  );
}

// -----------------------------------------------------
// 2. LIVE INTERVIEW
// -----------------------------------------------------

function LiveInterview({ config, onFinish, onBack }) {
  const questions = questionBank[config.type] || questionBank.Technical;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(config.duration * 60);
  const [showTips, setShowTips] = useState(true);

  const latestRef = useRef({ answers, onFinish, config });
  const finishedRef = useRef(false);

  useEffect(() => {
    latestRef.current = { answers, onFinish, config };
  }, [answers, onFinish, config]);

  // Countdown timer. The interval is created once per interview.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Finish exactly once when the timer reaches zero.
  useEffect(() => {
    if (remaining === 0 && !finishedRef.current) {
      finishedRef.current = true;
      latestRef.current.onFinish(
        latestRef.current.answers,
        latestRef.current.config
      );
    }
  }, [remaining]);

  const saveAnswer = (value) => {
    setAnswers((previous) => ({
      ...previous,
      [current]: value,
    }));
  };
  const appendVoiceTranscript = (transcript) => {
    setAnswers((previous) => {
      const existing = previous[current] || "";
      const separator = existing.trim() ? " " : "";

      return {
        ...previous,
        [current]: existing + separator + transcript,
      };
    });
  };

  const answeredCount = Object.values(answers).filter((answer) =>
    answer?.trim()
  ).length;

  const progress = (answeredCount / questions.length) * 100;
  const currentAnswer = answers[current] || "";
  const isLastQuestion = current === questions.length - 1;
  const timeIsLow = remaining <= 60;

  const handleFinish = () => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    onFinish(answers, config);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
      return;
    }

    setCurrent((value) => Math.min(questions.length - 1, value + 1));
  };

  return (
    <div className="space-y-6">
      {/* INTERVIEW HEADER */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 flex items-center gap-2 text-xs text-[var(--text-muted)] transition hover:text-red-400"
          >
            <ArrowBack fontSize="small" />
            Back to setup
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Interview in progress</h1>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-semibold text-green-500">
              LIVE SESSION
            </span>
          </div>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {config.role} · {config.type} · {config.difficulty}
          </p>
        </div>

        <div
          className={`flex items-center gap-3 self-start rounded-2xl border px-5 py-3 ${timeIsLow
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-[var(--border-color)] bg-[var(--input-bg)]"
            }`}
        >
          <Timer />
          <div>
            <p className="text-[10px] text-[var(--text-muted)]">
              TIME REMAINING
            </p>
            <p className="font-mono text-xl font-bold tabular-nums">
              {formatTime(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* PROGRESS */}

      <Panel className="!p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold">Interview progress</span>
          <span className="text-xs text-[var(--text-muted)]">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--input-bg)]">
          <motion.div
            className="h-full rounded-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Panel>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* QUESTION AND ANSWER */}

        <div className="min-w-0 space-y-5">
          <Panel className="relative overflow-hidden !p-0">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-red-500/[0.05] blur-3xl" />

            <div className="relative border-b border-[var(--border-color)] px-5 py-4 md:px-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wide text-red-400">
                  QUESTION {String(current + 1).padStart(2, "0")}
                </span>

                <span className="rounded-lg bg-[var(--input-bg)] px-3 py-1.5 text-[10px] text-[var(--text-muted)]">
                  {config.type}
                </span>
              </div>
            </div>

            <div className="relative px-5 py-8 md:px-8 md:py-10">
              <p className="mb-5 text-xs font-medium text-[var(--text-muted)]">
                Take a moment to understand the question.
              </p>

              <AnimatePresence mode="wait">
                <motion.h2
                  key={current}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl text-xl font-semibold leading-relaxed md:text-2xl"
                >
                  {questions[current]}
                </motion.h2>
              </AnimatePresence>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-red-500/10 px-3 py-2 text-[10px] font-medium text-red-400">
                  {config.difficulty}
                </span>
                <span className="rounded-lg bg-[var(--input-bg)] px-3 py-2 text-[10px] text-[var(--text-muted)]">
                  Practice question
                </span>
              </div>
            </div>
          </Panel>

          {/* ANSWER EDITOR */}

          <Panel>
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold">Your answer</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Write your response in your own words.
                </p>
              </div>

              <span className="text-xs text-[var(--text-muted)]">
                {currentAnswer.trim()
                  ? currentAnswer.trim().split(/\s+/).length
                  : 0}{" "}
                words
              </span>
            </div>

            <textarea
              value={currentAnswer}
              onChange={(event) => saveAnswer(event.target.value)}
              rows={10}
              placeholder="Start typing your answer here..."
              className="glass-input min-h-[230px] resize-y !leading-7"
            />
            <VoiceAnswerInput onTranscript={appendVoiceTranscript} /> 

            <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-[10px] text-[var(--text-muted)]">
                Your answer is saved automatically while this session is open.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrent((value) => Math.max(0, value - 1))}
                  disabled={current === 0}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-xs font-semibold transition hover:border-red-500/40 disabled:opacity-30"
                >
                  <ArrowBack fontSize="small" />
                  Previous
                </button>

                <PrimaryButton onClick={handleNext}>
                  {isLastQuestion ? "Finish interview" : "Next question"}
                  <ArrowForward fontSize="small" />
                </PrimaryButton>
              </div>
            </div>
          </Panel>

          <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 text-amber-400" fontSize="small" />
              <div>
                <p className="text-xs font-semibold">Practice tip</p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  {questionTips[current] || questionTips[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}

        <aside className="space-y-5 xl:sticky xl:top-6">
          {/* QUESTION NAVIGATOR */}

          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Questions</h3>
              <span className="text-[10px] text-[var(--text-muted)]">
                {questions.length} total
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answered = Boolean(answers[index]?.trim());
                const active = current === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrent(index)}
                    title={question}
                    className={`flex aspect-square items-center justify-center rounded-xl border text-xs font-semibold transition ${active
                        ? "border-red-500 bg-red-500 text-white"
                        : answered
                          ? "border-green-500/30 bg-green-500/10 text-green-500"
                          : "border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-muted)] hover:border-red-500/40"
                      }`}
                  >
                    {answered && !active ? (
                      <CheckCircle fontSize="small" />
                    ) : (
                      index + 1
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-[var(--border-color)] pt-4">
              <Legend color="bg-red-500" label="Current question" />
              <Legend color="bg-green-500" label="Answered" />
              <Legend color="bg-[var(--border-color)]" label="Not answered" />
            </div>
          </Panel>

          {/* SESSION DETAILS */}

          <Panel>
            <div className="mb-4 flex items-center gap-2">
              <Psychology className="text-red-400" />
              <h3 className="text-sm font-semibold">Session details</h3>
            </div>

            <div className="space-y-4">
              <SummaryItem label="Role" value={config.role} />
              <SummaryItem label="Type" value={config.type} />
              <SummaryItem label="Level" value={config.difficulty} />
              <SummaryItem label="Duration" value={`${config.duration} min`} />
            </div>
          </Panel>

          {/* TIPS */}

          <Panel>
            <button
              type="button"
              onClick={() => setShowTips((value) => !value)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="text-amber-400" fontSize="small" />
                <h3 className="text-sm font-semibold">Interview tips</h3>
              </div>

              <span className="text-xs text-[var(--text-muted)]">
                {showTips ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence>
              {showTips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-4 space-y-3 text-xs leading-5 text-[var(--text-muted)]">
                    <li>• Structure your answer before writing.</li>
                    <li>• Use examples wherever possible.</li>
                    <li>• Keep your answers clear and relevant.</li>
                    <li>• Review your response before moving on.</li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>

          <button
            type="button"
            onClick={handleFinish}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Finish interview now
            <ArrowForward fontSize="small" />
          </button>

          <p className="text-center text-[10px] leading-5 text-[var(--text-muted)]">
            This is a frontend practice simulation. AI evaluation is not
            connected yet.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

// -----------------------------------------------------
// 3. INTERVIEW RESULTS
// -----------------------------------------------------

function ResultsPage({ config, answers, onRestart }) {
  const questions = questionBank[config.type] || questionBank.Technical;

  const answeredCount = questions.filter((question, index) =>
    answers[index]?.trim()
  ).length;

  const skippedCount = questions.length - answeredCount;
  const completion = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* COMPLETION HEADER */}

      <div className="relative overflow-hidden rounded-3xl border border-green-500/20 bg-green-500/[0.04] p-6 text-center md:p-10">
        <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-green-500/[0.08] blur-3xl" />

        <div className="relative">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <CheckCircle sx={{ fontSize: 34 }} />
          </div>

          <span className="text-xs font-bold tracking-[0.18em] text-green-500">
            SESSION COMPLETED
          </span>

          <h1 className="mt-3 text-2xl font-bold md:text-3xl">
            Great work. You showed up and practiced.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Your {config.type.toLowerCase()} practice session for{" "}
            <strong>{config.role}</strong> is complete. Review your responses
            below.
          </p>
        </div>
      </div>

      {/* SESSION METRICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Questions answered"
          value={`${answeredCount}/${questions.length}`}
          description="Responses submitted"
          icon={<CheckCircle />}
        />

        <MetricCard
          label="Questions skipped"
          value={skippedCount}
          description="Questions without answers"
          icon={<Close />}
        />

        <MetricCard
          label="Completion"
          value={`${completion}%`}
          description="Session completion rate"
          icon={<AutoAwesome />}
        />
      </div>

      {/* EVALUATION PLACEHOLDER */}

      <Panel className="!border-red-500/20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-red-400">
              <Psychology />
              <span className="text-xs font-bold tracking-widest">
                AI PERFORMANCE EVALUATION
              </span>
            </div>

            <h2 className="text-xl font-bold">
              Your AI evaluation is coming soon.
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)]">
              This frontend currently records your responses and displays
              session statistics. Detailed scoring, answer quality analysis,
              communication feedback and improvement recommendations will
              become available after backend and AI integration.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-500">
            <Timer fontSize="small" />
            Awaiting AI integration
          </div>
        </div>
      </Panel>

      {/* ANSWER REVIEW */}

      <div>
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold">Your answer review</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Review the responses you entered during this session.
            </p>
          </div>

          <span className="text-xs text-[var(--text-muted)]">
            {questions.length} questions
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const answer = answers[index]?.trim();

            return (
              <Panel key={index}>
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xs font-bold text-red-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-xs font-semibold">
                        Question {index + 1}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                        {config.type}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold ${answer
                        ? "bg-green-500/10 text-green-500"
                        : "bg-[var(--input-bg)] text-[var(--text-muted)]"
                      }`}
                  >
                    {answer ? "Answered" : "Skipped"}
                  </span>
                </div>

                <h3 className="text-sm font-medium leading-6">{question}</h3>

                <div className="mt-4 rounded-xl bg-[var(--input-bg)] p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Your response
                  </p>

                  <p className="whitespace-pre-wrap text-xs leading-6 text-[var(--text-secondary)]">
                    {answer || "No response was submitted for this question."}
                  </p>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-col justify-between gap-4 border-t border-[var(--border-color)] pt-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold">Ready for another round?</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Practice again to improve your confidence and consistency.
          </p>
        </div>

        <PrimaryButton onClick={onRestart}>
          <RestartAlt fontSize="small" />
          Start New Interview
          <ArrowForward fontSize="small" />
        </PrimaryButton>
      </div>
    </div>
  );
}

function MetricCard({ label, value, description, icon }) {
  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        <span className="text-red-400">{icon}</span>
      </div>

      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        {description}
      </p>
    </Panel>
  );
}

// -----------------------------------------------------
// MAIN PAGE
// -----------------------------------------------------

export default function InterviewPage() {
  const [stage, setStage] = useState("setup");
  const [config, setConfig] = useState(null);
  const [answers, setAnswers] = useState({});

  const startInterview = (settings) => {
    setConfig(settings);
    setAnswers({});
    setStage("live");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const finishInterview = (responses) => {
    setAnswers(responses || {});
    setStage("results");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const restart = () => {
    setConfig(null);
    setAnswers({});
    setStage("setup");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
      >
        {stage === "setup" && <SetupPage onStart={startInterview} />}

        {stage === "live" && config && (
          <LiveInterview
            config={config}
            onFinish={finishInterview}
            onBack={() => setStage("setup")}
          />
        )}

        {stage === "results" && config && (
          <ResultsPage
            config={config}
            answers={answers}
            onRestart={restart}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}