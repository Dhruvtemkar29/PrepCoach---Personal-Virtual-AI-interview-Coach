
import { useMemo, useState } from "react";
import { motion } from "motion/react";

import {
  TrendingUp,
  TrendingDown,
  CalendarMonth,
  Psychology,
  RecordVoiceOver,
  Code,
  AccessTime,
  EmojiEvents,
  ArrowUpward,
  AutoAwesome,
  Insights,
} from "@mui/icons-material";

import GlassCard from "../components/ui/GlassCard";

// -----------------------------------------------------
// SAMPLE ANALYTICS DATA
// -----------------------------------------------------

const analyticsData = {
  "7 Days": {
    scores: [58, 65, 61, 72, 68, 85, 82],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    interviews: 7,
    hours: 5.5,
  },
  "30 Days": {
    scores: [55, 61, 58, 68, 65, 72, 69, 78, 74, 82, 79, 86],
    labels: ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23"],
    interviews: 24,
    hours: 16.5,
  },
  "90 Days": {
    scores: [48, 52, 55, 53, 61, 64, 60, 68, 72, 69, 76, 82],
    labels: ["Aug", "Aug", "Aug", "Aug", "Sep", "Sep", "Sep", "Sep", "Oct", "Oct", "Oct", "Nov"],
    interviews: 68,
    hours: 48,
  },
};

const skills = [
  { name: "Problem Solving", score: 91, previous: 82, icon: Psychology },
  { name: "Technical Knowledge", score: 86, previous: 78, icon: Code },
  { name: "Communication", score: 78, previous: 72, icon: RecordVoiceOver },
  { name: "Confidence", score: 72, previous: 68, icon: EmojiEvents },
];

const interviewTypes = [
  { name: "Technical", count: 12, score: 86 },
  { name: "Behavioral", count: 6, score: 79 },
  { name: "System Design", count: 4, score: 73 },
  { name: "HR / Culture Fit", count: 2, score: 82 },
];

const weeklyActivity = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2 },
  { day: "Wed", hours: 0.5 },
  { day: "Thu", hours: 1.8 },
  { day: "Fri", hours: 1 },
  { day: "Sat", hours: 3 },
  { day: "Sun", hours: 2.5 },
];

const insights = [
  {
    title: "Improve Communication",
    description: "Practice structuring answers using the STAR method.",
    tag: "Priority",
  },
  {
    title: "Strengthen System Design",
    description: "Work on scalability, caching and database architecture.",
    tag: "Recommended",
  },
  {
    title: "Maintain Your Strength",
    description: "Continue solving technical problems to maintain your progress.",
    tag: "Strength",
  },
];

// -----------------------------------------------------
// REUSABLE COMPONENTS
// -----------------------------------------------------

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-sora text-base font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  positive = true,
  delay = 0,
}) {
  return (
    <GlassCard hover delay={delay}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
          <Icon />
        </div>

        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
            positive
              ? "bg-green-500/10 text-green-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {positive ? (
            <TrendingUp fontSize="inherit" />
          ) : (
            <TrendingDown fontSize="inherit" />
          )}
          {change}
        </span>
      </div>

      <p className="mt-5 text-xs text-[var(--text-muted)]">{title}</p>
      <h3 className="mt-1 font-sora text-2xl font-bold">{value}</h3>
      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
        {description}
      </p>
    </GlassCard>
  );
}

// -----------------------------------------------------
// PERFORMANCE CHART
// -----------------------------------------------------

function PerformanceChart({ data }) {
  const width = 600;
  const height = 230;
  const padding = 35;

  const points = data.scores.map((score, index) => {
    const x =
      padding +
      (index / Math.max(data.scores.length - 1, 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      (score / 100) * (height - padding * 2);

    return {
      x,
      y,
      score,
      label: data.labels[index],
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${points[0].x},${height - padding}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${points[points.length - 1].x},${height - padding}`,
  ].join(" ");

  return (
    <GlassCard>
      <SectionHeading
        title="Performance Progress"
        subtitle="Your interview scores over time"
        action={
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[#ff4545]" />
            Interview score
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <h3 className="font-sora text-3xl font-bold">
          {data.average}%
        </h3>
        <span className="mb-1 flex items-center gap-1 text-xs text-green-500">
          <ArrowUpward fontSize="inherit" />
          Average performance
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[210px] w-full overflow-visible sm:h-[230px]"
          preserveAspectRatio="none"
          role="img"
          aria-label="Interview performance line chart"
        >
          <defs>
            <linearGradient
              id="analyticsArea"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ff4545"
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor="#ff4545"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((value) => {
            const y =
              height -
              padding -
              (value / 100) * (height - padding * 2);

            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.10"
                  strokeDasharray="4 5"
                />
                <text
                  x="2"
                  y={y + 4}
                  fontSize="10"
                  fill="currentColor"
                  opacity="0.5"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill="url(#analyticsArea)" />

          <polyline
            points={linePoints}
            fill="none"
            stroke="#ff4545"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#ff4545"
                stroke="var(--bg-primary)"
                strokeWidth="2"
              />
              <title>{`${point.label}: ${point.score}%`}</title>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between gap-1 overflow-hidden px-6 text-[10px] text-[var(--text-muted)]">
        {data.labels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="min-w-0 truncate text-center"
          >
            {label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// SKILL PERFORMANCE
// -----------------------------------------------------

function SkillPerformance() {
  const strongestSkill = [...skills].sort(
    (a, b) => b.score - a.score
  )[0];

  return (
    <GlassCard>
      <SectionHeading
        title="Skill Intelligence"
        subtitle="Your strengths and improvement areas"
      />

      <div className="space-y-6">
        {skills.map((skill, index) => {
          const Icon = skill.icon;
          const improvement = skill.score - skill.previous;

          return (
            <div key={skill.name}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-[#ff5555]">
                    <Icon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-medium">
                    {skill.name}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <span className="font-sora text-sm font-bold">
                    {skill.score}%
                  </span>
                  <span className="ml-2 text-[10px] text-green-500">
                    +{improvement}
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.score}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-[#ff7777] to-[#dc2626]"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-green-500/15 bg-green-500/5 p-3">
        <p className="text-xs font-semibold text-green-500">
          Strongest Skill
        </p>
        <p className="mt-1 text-sm font-medium">
          {strongestSkill.name} · {strongestSkill.score}%
        </p>
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// INTERVIEW TYPE BREAKDOWN
// -----------------------------------------------------

function InterviewTypeBreakdown() {
  const maxCount = Math.max(
    ...interviewTypes.map((item) => item.count)
  );

  return (
    <GlassCard>
      <SectionHeading
        title="Interview Type Analysis"
        subtitle="Performance across different interview categories"
      />

      <div className="space-y-5">
        {interviewTypes.map((item, index) => (
          <div key={item.name}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium">{item.name}</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  {item.count} interviews
                </p>
              </div>

              <span className="font-sora text-sm font-bold">
                {item.score}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${(item.count / maxCount) * 100}%`,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                }}
                className="h-full rounded-full bg-gradient-to-r from-[#ff7777] to-[#dc2626]"
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// WEEKLY PRACTICE ACTIVITY
// -----------------------------------------------------

function WeeklyActivity() {
  const maxHours = Math.max(
    ...weeklyActivity.map((item) => item.hours)
  );

  const totalHours = weeklyActivity.reduce(
    (total, item) => total + item.hours,
    0
  );

  const dailyAverage = totalHours / weeklyActivity.length;

  return (
    <GlassCard>
      <SectionHeading
        title="Practice Consistency"
        subtitle="Hours spent practicing this week"
      />

      <div className="flex h-48 items-end justify-between gap-3 pt-4">
        {weeklyActivity.map((item, index) => (
          <div
            key={item.day}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
              {item.hours}h
            </span>

            <motion.div
              initial={{ height: 0 }}
              whileInView={{
                height: `${(item.hours / maxHours) * 100}%`,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
              }}
              className={`w-full max-w-10 rounded-t-lg ${
                index === 5
                  ? "bg-gradient-to-t from-red-700 to-red-400"
                  : "bg-gradient-to-t from-red-900/70 to-red-400/80"
              }`}
              style={{
                minHeight: item.hours > 0 ? "8px" : "0px",
              }}
              title={`${item.hours} practice hours`}
            />

            <span className="text-[10px] text-[var(--text-muted)]">
              {item.day}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[var(--input-bg)] p-3">
        <div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Total this week
          </p>
          <p className="mt-1 font-sora text-lg font-bold">
            {totalHours.toFixed(1)} Hours
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-[var(--text-muted)]">
            Daily average
          </p>
          <p className="mt-1 font-sora text-lg font-bold">
            {dailyAverage.toFixed(2)} Hours
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// AI INSIGHTS
// -----------------------------------------------------

function AIInsights() {
  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-2 text-[#ff6666]">
          <AutoAwesome />
          <span className="text-xs font-bold tracking-wider">
            AI PERFORMANCE INSIGHTS
          </span>
        </div>

        <h3 className="font-sora text-lg font-semibold">
          Your improvement roadmap
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          Focus on these areas to improve your overall interview
          performance.
        </p>

        <div className="mt-5 space-y-3">
          {insights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold">
                  {item.title}
                </p>

                <span className="rounded-full bg-red-500/10 px-2 py-1 text-[9px] text-[#ff6666]">
                  {item.tag}
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// MAIN ANALYTICS PAGE
// -----------------------------------------------------

export default function AnalyticsPage() {
  const [range, setRange] = useState("30 Days");

  const currentData = useMemo(() => {
    const selected = analyticsData[range];

    const average = Math.round(
      selected.scores.reduce((sum, score) => sum + score, 0) /
        selected.scores.length
    );

    return {
      ...selected,
      average,
    };
  }, [range]);

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#ff6666]">
            <Insights fontSize="small" />
            PERFORMANCE INTELLIGENCE
          </div>

          <h1 className="font-sora text-2xl font-bold md:text-3xl">
            Performance <span className="gradient-text">Analytics</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Understand your progress, discover strengths and
            identify areas to improve.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl glass px-3 py-2">
          <CalendarMonth
            className="text-[#ff5555]"
            fontSize="small"
          />

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Select analytics date range"
            className="max-w-full bg-transparent text-xs font-medium text-[var(--text-primary)] outline-none"
          >
            <option value="7 Days">Last 7 Days</option>
            <option value="30 Days">Last 30 Days</option>
            <option value="90 Days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="dashboard-grid">
        <MetricCard
          title="Average Performance"
          value={`${currentData.average}%`}
          change="+12%"
          description="Compared with previous period"
          icon={TrendingUp}
          delay={0}
        />

        <MetricCard
          title="Interviews Completed"
          value={currentData.interviews}
          change="+18%"
          description="Sessions in selected period"
          icon={Psychology}
          delay={0.08}
        />

        <MetricCard
          title="Practice Hours"
          value={`${currentData.hours}h`}
          change="+8%"
          description="Total preparation time"
          icon={AccessTime}
          delay={0.16}
        />

        <MetricCard
          title="Top Skill"
          value="91%"
          change="+9%"
          description="Problem solving"
          icon={EmojiEvents}
          delay={0.24}
        />
      </div>

      {/* PERFORMANCE CHART */}
      <PerformanceChart data={currentData} />

      {/* SKILLS AND INTERVIEW TYPES */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SkillPerformance />
        <InterviewTypeBreakdown />
      </div>

      {/* ACTIVITY AND AI INSIGHTS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <WeeklyActivity />
        <AIInsights />
      </div>

      {/* NEXT MILESTONE */}
      <GlassCard className="!border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
              <Code />
            </div>

            <div>
              <h3 className="font-sora text-sm font-semibold">
                Your next milestone
              </h3>

              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Reach 90% average performance in your next
                interview sessions.
              </p>
            </div>
          </div>

          <div className="w-full sm:min-w-[140px] sm:max-w-[180px]">
            <div className="mb-2 flex justify-between text-[10px]">
              <span className="text-[var(--text-muted)]">
                Current progress
              </span>
              <span className="font-semibold">82 / 90</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
              <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-[#ff7777] to-[#dc2626]" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* DEMO DATA NOTICE */}
      <p className="text-center text-[10px] leading-relaxed text-[var(--text-muted)]">
        Analytics currently displays illustrative sample data.
        Real performance metrics and AI insights will be calculated
        from completed interview sessions after backend integration.
      </p>
    </div>
  );
}
