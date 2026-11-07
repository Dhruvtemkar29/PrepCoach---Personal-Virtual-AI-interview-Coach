
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Route,
  CheckCircle,
  RadioButtonUnchecked,
  Code,
  Psychology,
  RecordVoiceOver,
  Work,
  TrendingUp,
  AutoAwesome,
  Flag,
  ArrowForward,
  RestartAlt,
  CalendarMonth,
  EmojiEvents,
} from "@mui/icons-material";
import GlassCard from "../components/ui/GlassCard";

const STORAGE_KEY = "prepcoach-roadmap-progress";

const initialWeeks = [
  {
    id: 1,
    title: "Foundation & Self Assessment",
    subtitle: "Understand your current interview readiness",
    duration: "Week 1",
    focus: "Foundation",
    tasks: [
      { id: 101, title: "Identify target job roles", detail: "Choose 2–3 career roles to prepare for." },
      { id: 102, title: "Review core programming concepts", detail: "Revise variables, loops, functions and OOP." },
      { id: 103, title: "Prepare your self introduction", detail: "Create a concise 60–90 second introduction." },
      { id: 104, title: "Complete a baseline mock interview", detail: "Evaluate your starting performance." },
    ],
  },
  {
    id: 2,
    title: "Technical Skills Development",
    subtitle: "Strengthen technical knowledge and problem solving",
    duration: "Week 2",
    focus: "Technical",
    tasks: [
      { id: 201, title: "Practice data structures and algorithms", detail: "Solve arrays, strings, stacks and linked lists." },
      { id: 202, title: "Revise database fundamentals", detail: "Practice SQL, joins and normalization." },
      { id: 203, title: "Review your technical projects", detail: "Prepare architecture and implementation explanations." },
      { id: 204, title: "Attempt a technical mock interview", detail: "Practice explaining your solutions." },
    ],
  },
  {
    id: 3,
    title: "Communication & Behavioral Skills",
    subtitle: "Improve confidence and interview communication",
    duration: "Week 3",
    focus: "Communication",
    tasks: [
      { id: 301, title: "Practice common HR questions", detail: "Prepare strengths, weaknesses and career goals." },
      { id: 302, title: "Learn the STAR response method", detail: "Structure behavioral answers clearly." },
      { id: 303, title: "Practice speaking with clarity", detail: "Focus on pace, structure and concise answers." },
      { id: 304, title: "Complete a behavioral mock interview", detail: "Review your responses and confidence." },
    ],
  },
  {
    id: 4,
    title: "Final Interview Readiness",
    subtitle: "Combine your skills and prepare for real interviews",
    duration: "Week 4",
    focus: "Readiness",
    tasks: [
      { id: 401, title: "Complete a full mock interview", detail: "Attempt a complete interview simulation." },
      { id: 402, title: "Review your performance analytics", detail: "Identify your strongest and weakest areas." },
      { id: 403, title: "Revise your resume and projects", detail: "Ensure your resume matches your target role." },
      { id: 404, title: "Create your final improvement checklist", detail: "Set goals for continued preparation." },
    ],
  },
];

const skills = [
  {
    name: "Technical Knowledge",
    icon: <Code />,
    progress: 72,
    description: "Programming and technical concepts",
  },
  {
    name: "Problem Solving",
    icon: <Psychology />,
    progress: 65,
    description: "Logical thinking and coding practice",
  },
  {
    name: "Communication",
    icon: <RecordVoiceOver />,
    progress: 58,
    description: "Clarity and structured responses",
  },
  {
    name: "Interview Confidence",
    icon: <Work />,
    progress: 76,
    description: "Confidence during interview sessions",
  },
];

function getInitialWeeks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return initialWeeks;

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed) || parsed.length !== initialWeeks.length) {
      return initialWeeks;
    }

    return initialWeeks.map((week) => {
      const savedWeek = parsed.find((item) => item.id === week.id);

      return {
        ...week,
        tasks: week.tasks.map((task) => {
          const savedTask = savedWeek?.tasks?.find(
            (item) => item.id === task.id
          );

          return {
            ...task,
            completed: Boolean(savedTask?.completed),
          };
        }),
      };
    });
  } catch {
    return initialWeeks;
  }
}

export default function RoadmapPage() {
  const [weeks, setWeeks] = useState(getInitialWeeks);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
  }, [weeks]);

  const {
    totalTasks,
    completedTasks,
    overallProgress,
    completedWeeks,
    activeWeekData,
  } = useMemo(() => {
    const total = weeks.reduce(
      (sum, week) => sum + week.tasks.length,
      0
    );

    const completed = weeks.reduce(
      (sum, week) =>
        sum + week.tasks.filter((task) => task.completed).length,
      0
    );

    return {
      totalTasks: total,
      completedTasks: completed,
      overallProgress: total
        ? Math.round((completed / total) * 100)
        : 0,
      completedWeeks: weeks.filter((week) =>
        week.tasks.every((task) => task.completed)
      ).length,
      activeWeekData: weeks.find((week) => week.id === activeWeek) || weeks[0],
    };
  }, [weeks, activeWeek]);

  const weeklyProgress = (week) => {
    const completed = week.tasks.filter(
      (task) => task.completed
    ).length;

    return Math.round((completed / week.tasks.length) * 100);
  };

  const toggleTask = (weekId, taskId) => {
    setWeeks((previous) =>
      previous.map((week) =>
        week.id === weekId
          ? {
              ...week,
              tasks: week.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : week
      )
    );
  };

  const resetProgress = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all roadmap progress?"
    );

    if (!confirmed) return;

    setWeeks(initialWeeks);
    setActiveWeek(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  const circumference = 2 * Math.PI * 66;

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--accent)]">
            <Route fontSize="small" />
            PREPARATION JOURNEY
          </div>

          <h1 className="font-sora text-2xl font-bold sm:text-3xl">
            Your Preparation Roadmap
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Follow your structured learning path and build interview confidence.
          </p>
        </div>

        <button
          type="button"
          onClick={resetProgress}
          className="secondary-button flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          <RestartAlt fontSize="small" />
          Reset Progress
        </button>
      </div>

      {/* Overall Progress */}
      <GlassCard>
        <div className="relative grid gap-7 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--accent)]">
              <AutoAwesome fontSize="small" />
              YOUR LEARNING JOURNEY
            </div>

            <h2 className="mt-3 font-sora text-2xl font-bold">
              Every step takes you closer.
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
              Complete weekly activities, strengthen important skills, and
              track your progress toward interview readiness.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <div>
                <p className="font-sora text-2xl font-bold">
                  {completedTasks}/{totalTasks}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Tasks completed
                </p>
              </div>

              <div>
                <p className="font-sora text-2xl font-bold">
                  {completedWeeks}/4
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Weeks completed
                </p>
              </div>

              <div>
                <p className="font-sora text-2xl font-bold">4 Weeks</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Roadmap duration
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg
                viewBox="0 0 160 160"
                className="h-full w-full -rotate-90"
                role="img"
                aria-label={`Overall roadmap progress ${overallProgress}%`}
              >
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="11"
                />

                <motion.circle
                  cx="80"
                  cy="80"
                  r="66"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset:
                      circumference * (1 - overallProgress / 100),
                  }}
                  transition={{ duration: 0.8 }}
                />
              </svg>

              <div className="absolute text-center">
                <h3 className="font-sora text-3xl font-bold">
                  {overallProgress}%
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Completed
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm font-medium">
              Overall roadmap progress
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Learning Path */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <CalendarMonth className="text-[var(--accent)]" />
            <h2 className="font-sora text-xl font-bold">
              Your Learning Path
            </h2>
          </div>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Four focused stages to strengthen your interview preparation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {weeks.map((week) => {
            const progress = weeklyProgress(week);
            const completed = progress === 100;
            const active = activeWeek === week.id;

            return (
              <motion.button
                type="button"
                key={week.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveWeek(week.id)}
                aria-pressed={active}
                className={`glass-card relative rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/5"
                    : "border-[var(--border-color)]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
                    {week.duration}
                  </span>

                  {completed ? (
                    <CheckCircle className="text-emerald-500" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-color)] text-xs font-bold">
                      {week.id}
                    </span>
                  )}
                </div>

                <h3 className="font-sora text-sm font-bold leading-snug">
                  {week.title}
                </h3>

                <p className="mt-2 min-h-10 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {week.subtitle}
                </p>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">
                      Progress
                    </span>
                    <span className="font-semibold">{progress}%</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-color)]">
                    <motion.div
                      className="h-full rounded-full bg-[var(--accent)]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>
                    {week.tasks.filter((task) => task.completed).length}/
                    {week.tasks.length} tasks
                  </span>
                  <ArrowForward fontSize="small" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Active Week and Skills */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <GlassCard>
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[var(--accent)]">
                {activeWeekData.duration.toUpperCase()}
              </p>

              <h2 className="mt-2 font-sora text-xl font-bold">
                {activeWeekData.title}
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {activeWeekData.subtitle}
              </p>
            </div>

            <span className="w-fit rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold">
              {weeklyProgress(activeWeekData)}% complete
            </span>
          </div>

          <div className="space-y-3">
            {activeWeekData.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] p-4 transition hover:bg-[var(--glass-bg)]"
              >
                <button
                  type="button"
                  onClick={() => toggleTask(activeWeek, task.id)}
                  className={`mt-0.5 shrink-0 transition ${
                    task.completed
                      ? "text-emerald-500"
                      : "text-[var(--text-secondary)] hover:text-[var(--accent)]"
                  }`}
                  aria-label={
                    task.completed
                      ? `Mark ${task.title} incomplete`
                      : `Mark ${task.title} complete`
                  }
                >
                  {task.completed ? (
                    <CheckCircle />
                  ) : (
                    <RadioButtonUnchecked />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      task.completed
                        ? "text-[var(--text-secondary)] line-through"
                        : ""
                    }`}
                  >
                    {task.title}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {task.detail}
                  </p>
                </div>

                {task.completed && (
                  <span className="text-[10px] font-bold text-emerald-500">
                    DONE
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Skill Development */}
        <GlassCard>
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-[var(--accent)]">
              <TrendingUp fontSize="small" />
              <span className="text-xs font-bold tracking-wide">
                SKILL DEVELOPMENT
              </span>
            </div>

            <h2 className="font-sora text-lg font-bold">
              Your Skill Focus
            </h2>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Illustrative skill progress indicators.
            </p>
          </div>

          <div className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-[var(--accent)]">
                      {skill.icon}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {skill.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {skill.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold">
                    {skill.progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-[var(--accent)]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <AutoAwesome fontSize="small" />
              <p className="text-sm font-semibold">Preparation tip</p>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              Consistent daily practice is more effective than last-minute
              preparation. Try completing at least one task each day.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Final Milestone */}
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
              {completedWeeks === 4 ? <EmojiEvents /> : <Flag />}
            </div>

            <div>
              <h3 className="font-sora font-bold">
                {completedWeeks === 4
                  ? "Roadmap Completed!"
                  : "Your Final Milestone"}
              </h3>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {completedWeeks === 4
                  ? "You have completed all four preparation stages. Keep practising!"
                  : "Complete all four weeks and finish your final mock interview."}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="font-sora text-2xl font-bold">
              {completedWeeks}/4
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Stages completed
            </p>
          </div>
        </div>
      </GlassCard>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        Roadmap progress is saved locally in this browser. Skill percentages
        are illustrative sample data and are not connected to AI evaluation.
      </p>
    </div>
  );
}
