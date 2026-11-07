
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import {
  ArrowUpward,
  ArrowForward,
  PlayArrow,
  TrendingUp,
  AccessTime,
  EmojiEvents,
  LocalFireDepartment,
  Psychology,
  RecordVoiceOver,
  Code,
  TipsAndUpdates,
  CheckCircle,
  CalendarMonth,
  AutoAwesome,
} from "@mui/icons-material";

import GlassCard from "../components/ui/GlassCard";

// --------------------------------------------------
// DEMO DATA
// Replace these values with backend API data later.
// --------------------------------------------------

const stats = [
  {
    label: "Total Interviews",
    value: "24",
    change: "+18%",
    detail: "vs last month",
    icon: Psychology,
  },
  {
    label: "Average Score",
    value: "82%",
    change: "+12%",
    detail: "vs last month",
    icon: EmojiEvents,
  },
  {
    label: "Practice Hours",
    value: "16.5",
    change: "+8%",
    detail: "this month",
    icon: AccessTime,
  },
  {
    label: "Practice Streak",
    value: "7 Days",
    change: "Best: 12 days",
    detail: "keep going!",
    icon: LocalFireDepartment,
  },
];

const performanceByPeriod = {
  "This week": [
    { day: "Mon", score: 52 },
    { day: "Tue", score: 65 },
    { day: "Wed", score: 58 },
    { day: "Thu", score: 73 },
    { day: "Fri", score: 68 },
    { day: "Sat", score: 85 },
    { day: "Sun", score: 82 },
  ],
  "Last week": [
    { day: "Mon", score: 45 },
    { day: "Tue", score: 54 },
    { day: "Wed", score: 62 },
    { day: "Thu", score: 58 },
    { day: "Fri", score: 70 },
    { day: "Sat", score: 76 },
    { day: "Sun", score: 74 },
  ],
  "This month": [
    { day: "W1", score: 48 },
    { day: "W2", score: 59 },
    { day: "W3", score: 72 },
    { day: "W4", score: 82 },
    { day: "W5", score: 78 },
    { day: "W6", score: 86 },
    { day: "W7", score: 82 },
  ],
};

const skills = [
  { name: "Technical Knowledge", score: 86, icon: Code },
  { name: "Communication", score: 78, icon: RecordVoiceOver },
  { name: "Problem Solving", score: 91, icon: Psychology },
  { name: "Confidence", score: 72, icon: EmojiEvents },
];

const sessions = [
  {
    role: "Frontend Developer",
    type: "Technical Interview",
    date: "Today, 10:30 AM",
    score: 86,
    status: "Completed",
  },
  {
    role: "React Developer",
    type: "Technical Interview",
    date: "Yesterday",
    score: 79,
    status: "Completed",
  },
  {
    role: "Software Engineer",
    type: "HR Interview",
    date: "28 Oct 2026",
    score: 82,
    status: "Completed",
  },
];

const activity = [
  1, 0, 1, 1, 0, 1, 1,
  1, 1, 0, 1, 0, 1, 1,
  0, 1, 1, 1, 1, 0, 1,
  1, 1, 0, 1, 1, 1, 1,
];

// --------------------------------------------------
// REUSABLE SECTION HEADING
// --------------------------------------------------

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="font-sora text-base font-semibold md:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {subtitle}
        </p>
      </div>

      {action}
    </div>
  );
}

// --------------------------------------------------
// INTERVIEW READINESS
// --------------------------------------------------

function ReadinessCard() {
  const score = 78;
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className="relative overflow-hidden !border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[#ff6666]">
            <AutoAwesome fontSize="small" />

            <span className="text-[10px] font-bold tracking-[1.5px]">
              YOUR AI INSIGHT
            </span>
          </div>

          <h2 className="font-sora text-xl font-bold md:text-2xl">
            Interview Readiness
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            You're making good progress! Keep improving your communication
            skills to become more interview-ready.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-[#22c55e]">
            <TrendingUp fontSize="small" />
            <span>12% improvement this month</span>
          </div>
        </div>

        <div className="relative mx-auto flex h-36 w-36 shrink-0 items-center justify-center sm:mx-4">
          <svg
            className="h-full w-full -rotate-90"
            viewBox="0 0 120 120"
            role="img"
            aria-label={`Interview readiness score ${score} out of 100`}
          >
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="9"
              className="text-[var(--border-color)]"
            />

            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#ff4545"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
          </svg>

          <div className="absolute text-center">
            <p className="font-sora text-3xl font-bold">{score}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              OUT OF 100
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// --------------------------------------------------
// PERFORMANCE CHART
// --------------------------------------------------

function PerformanceChart() {
  const [period, setPeriod] = useState("This week");

  const data = performanceByPeriod[period];

  const average = Math.round(
    data.reduce((total, item) => total + item.score, 0) / data.length
  );

  const points = data
    .map((item, index) => {
      const x = 12 + index * 46;
      const y = 145 - (item.score / 100) * 125;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <GlassCard className="h-full">
      <SectionHeading
        title="Performance Overview"
        subtitle="Your interview scores over time"
        action={
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Select performance period"
            className="max-w-[120px] rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-2 text-xs text-[var(--text-primary)] outline-none transition focus:border-red-500"
          >
            <option value="This week">This week</option>
            <option value="Last week">Last week</option>
            <option value="This month">This month</option>
          </select>
        }
      />

      <div className="mt-6">
        <div className="mb-3 flex items-end gap-2">
          <span className="font-sora text-3xl font-bold">
            {average}%
          </span>

          <span className="mb-1 flex items-center text-xs text-[#22c55e]">
            <ArrowUpward fontSize="inherit" />
            {period === "This week" ? "12%" : "Demo data"}
          </span>
        </div>

        <svg
          viewBox="0 0 300 170"
          className="h-[190px] w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${period} performance chart`}
        >
          {[20, 60, 100, 140].map((y) => (
            <line
              key={y}
              x1="5"
              y1={y}
              x2="295"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.10"
              strokeDasharray="4 5"
            />
          ))}

          <defs>
            <linearGradient
              id="performanceFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#ff4545" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#ff4545" stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon
            points={`12,160 ${points} 288,160`}
            fill="url(#performanceFill)"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#ff4545"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {data.map((item, index) => {
            const x = 12 + index * 46;
            const y = 145 - (item.score / 100) * 125;

            return (
              <circle
                key={item.day}
                cx={x}
                cy={y}
                r="4"
                fill="#ff4545"
                stroke="var(--bg-primary)"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="flex justify-between px-1 text-[10px] text-[var(--text-muted)]">
          {data.map((item) => (
            <span key={item.day}>{item.day}</span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// --------------------------------------------------
// SKILL BREAKDOWN
// --------------------------------------------------

function SkillBreakdown() {
  return (
    <GlassCard className="h-full">
      <SectionHeading
        title="Skill Breakdown"
        subtitle="Your current performance by skill"
      />

      <div className="mt-6 space-y-6">
        {skills.map((skill, index) => {
          const Icon = skill.icon;

          return (
            <div key={skill.name}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon sx={{ fontSize: 17, color: "#ff5555" }} />

                  <span className="text-xs font-medium">
                    {skill.name}
                  </span>
                </div>

                <span className="font-mono text-xs font-semibold">
                  {skill.score}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.12,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-[#ff7777] to-[#dc2626]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// --------------------------------------------------
// WEEKLY ACTIVITY
// --------------------------------------------------

function WeeklyActivity() {
  const activeDays = activity.filter(Boolean).length;

  return (
    <GlassCard>
      <SectionHeading
        title="Practice Activity"
        subtitle="Your consistency over the last 28 days"
      />

      <div className="mt-5 grid grid-cols-7 gap-2 sm:gap-3">
        {activity.map((active, index) => (
          <div
            key={index}
            title={active ? "Practice completed" : "No practice"}
            aria-label={active ? "Practice completed" : "No practice"}
            className={`aspect-square rounded-md border ${
              active
                ? "border-red-500/30 bg-red-500/65"
                : "border-[var(--border-color)] bg-[var(--input-bg)]"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>28-day activity</span>

        <span className="text-[#ff6666]">
          {activeDays} active days
        </span>
      </div>
    </GlassCard>
  );
}

// --------------------------------------------------
// RECENT INTERVIEWS
// --------------------------------------------------

function RecentSessions({ onViewAll }) {
  return (
    <GlassCard>
      <SectionHeading
        title="Recent Interviews"
        subtitle="Your latest practice sessions"
        action={
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-[#ff5555] transition hover:text-[#ff7777]"
          >
            View all
            <ArrowForward fontSize="inherit" />
          </button>
        }
      />

      <div className="mt-4 space-y-1">
        {sessions.map((session, index) => (
          <div
            key={`${session.role}-${index}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-4 transition hover:bg-[var(--bg-glass-hover)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
                <Psychology />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {session.role}
                </p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {session.type} · {session.date}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-sora text-lg font-bold">
                {session.score}%
              </p>

              <p className="text-[10px] text-[#22c55e]">
                {session.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// --------------------------------------------------
// AI RECOMMENDATIONS
// --------------------------------------------------

function AIRecommendations({ onStartPractice }) {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-[#ff6666]">
          <TipsAndUpdates />

          <span className="text-xs font-bold tracking-wider">
            AI RECOMMENDATIONS
          </span>
        </div>

        <h3 className="font-sora text-lg font-semibold">
          Your next improvement
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          Focus on communication and confidence. Practice explaining your
          technical solutions using structured examples.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/5 p-3">
          <CheckCircle className="text-[#ff5555]" fontSize="small" />

          <p className="text-xs">
            Recommended: Behavioral Interview Practice
          </p>
        </div>

        <button
          type="button"
          onClick={onStartPractice}
          className="primary-button mt-5 flex w-full items-center justify-center gap-2"
        >
          Start Recommended Practice
          <ArrowForward fontSize="small" />
        </button>
      </div>
    </GlassCard>
  );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

export default function DashboardPage() {
  const navigate = useNavigate();

  const currentDate = useMemo(() => {
    return new Date()
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  }, []);

  const handleStartInterview = () => {
    navigate("/app/interview");
  };

  const handleViewHistory = () => {
    navigate("/app/history");
  };

  return (
    <div className="space-y-7">
      {/* WELCOME HEADER */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-5 md:flex-row md:items-center"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <CalendarMonth fontSize="small" />
            {currentDate}
          </div>

          <h1 className="font-sora text-2xl font-bold md:text-3xl">
            Welcome back,{" "}
            <span className="gradient-text">Dhruv!</span>
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Here's your interview preparation overview.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartInterview}
          className="primary-button flex items-center justify-center gap-2"
        >
          <PlayArrow />
          Start AI Interview
        </button>
      </motion.div>

      {/* KPI CARDS */}

      <div className="dashboard-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <GlassCard
              key={stat.label}
              hover
              delay={index * 0.07}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
                  <Icon />
                </div>

                <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-[#22c55e]">
                  {stat.change}
                </span>
              </div>

              <p className="mt-5 text-xs text-[var(--text-muted)]">
                {stat.label}
              </p>

              <h2 className="mt-1 font-sora text-2xl font-bold">
                {stat.value}
              </h2>

              <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                {stat.detail}
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* INTERVIEW READINESS */}

      <ReadinessCard />

      {/* ANALYTICS */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PerformanceChart />
        <SkillBreakdown />
      </div>

      {/* ACTIVITY AND AI RECOMMENDATIONS */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyActivity />
        </div>

        <AIRecommendations
          onStartPractice={handleStartInterview}
        />
      </div>

      {/* RECENT INTERVIEW SESSIONS */}

      <RecentSessions onViewAll={handleViewHistory} />

      {/* DEMO DATA NOTICE */}

      <p className="pb-2 text-center text-[10px] text-[var(--text-muted)]">
        Dashboard metrics shown here are sample data for the initial UI.
      </p>
    </div>
  );
}
