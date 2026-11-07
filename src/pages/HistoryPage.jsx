
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  ListFilter ,
  Eye,
  Trash2 ,
  X,
  CheckCircle,
  CalendarDays,
  TrendingUp,
  Brain ,
  ArrowUpRight,
  Clock,
  BriefcaseBusiness,
  ChevronRight,
  RotateCcw,
  FileText,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";

// -----------------------------------------------------
// DEMO INTERVIEW DATA
// Replace with backend data when API is available.
// -----------------------------------------------------

const initialSessions = [
  {
    id: 1,
    role: "Frontend Developer",
    company: "General Practice",
    type: "Technical",
    difficulty: "Intermediate",
    date: "02 Nov 2026",
    time: "10:30 AM",
    duration: "18 min",
    score: 86,
    status: "Completed",
    questions: 5,
    answered: 5,
    feedback:
      "Good understanding of React concepts and frontend fundamentals. Work on providing more detailed examples when explaining technical decisions.",
  },
  {
    id: 2,
    role: "React Developer",
    company: "General Practice",
    type: "Technical",
    difficulty: "Advanced",
    date: "01 Nov 2026",
    time: "04:15 PM",
    duration: "25 min",
    score: 79,
    status: "Completed",
    questions: 5,
    answered: 5,
    feedback:
      "Strong technical foundation. Improve the structure of your explanations and include more practical examples.",
  },
  {
    id: 3,
    role: "Software Engineer",
    company: "General Practice",
    type: "HR / Culture Fit",
    difficulty: "Beginner",
    date: "30 Oct 2026",
    time: "11:00 AM",
    duration: "14 min",
    score: 82,
    status: "Completed",
    questions: 5,
    answered: 4,
    feedback:
      "Your answers were clear. Focus on using the STAR method to communicate behavioral examples.",
  },
  {
    id: 4,
    role: "Backend Developer",
    company: "General Practice",
    type: "System Design",
    difficulty: "Advanced",
    date: "28 Oct 2026",
    time: "02:30 PM",
    duration: "22 min",
    score: 0,
    status: "In Progress",
    questions: 5,
    answered: 2,
    feedback: "This session has not been completed yet.",
  },
  {
    id: 5,
    role: "Full Stack Developer",
    company: "General Practice",
    type: "Behavioral",
    difficulty: "Intermediate",
    date: "26 Oct 2026",
    time: "09:45 AM",
    duration: "16 min",
    score: 74,
    status: "Completed",
    questions: 5,
    answered: 5,
    feedback:
      "Work on giving concise answers and connecting your experience to the job requirements.",
  },
  {
    id: 6,
    role: "UI Developer",
    company: "General Practice",
    type: "Technical",
    difficulty: "Beginner",
    date: "24 Oct 2026",
    time: "03:20 PM",
    duration: "12 min",
    score: 68,
    status: "Completed",
    questions: 5,
    answered: 4,
    feedback:
      "Continue strengthening your fundamentals and practice explaining your implementation choices.",
  },
];

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

function getScoreColor(score) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function getScoreBackground(score) {
  if (score >= 80) return "bg-green-500/10";
  if (score >= 60) return "bg-amber-500/10";
  return "bg-red-500/10";
}

function StatusBadge({ status }) {
  const completed = status === "Completed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold ${
        completed
          ? "bg-green-500/10 text-green-500"
          : "bg-amber-500/10 text-amber-500"
      }`}
    >
      {completed ? (
        <CheckCircle size={12} />
      ) : (
        <Clock size={12} />
      )}
      {status}
    </span>
  );
}

function ScoreBadge({ score }) {
  if (!score) {
    return (
      <span className="text-xs text-[var(--text-muted)]">
        Not evaluated
      </span>
    );
  }

  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-sm font-bold ${getScoreColor(
        score
      )} ${getScoreBackground(score)}`}
    >
      {score}%
    </span>
  );
}

function SummaryCard({ label, value, description, icon: Icon, color }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
          <h2 className="mt-3 text-2xl font-bold">{value}</h2>
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--input-bg)] ${color}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </GlassCard>
  );
}

// -----------------------------------------------------
// SESSION DETAILS MODAL
// -----------------------------------------------------

function SessionDetails({ session, onX }) {
  if (!session) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onX}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
          className="glass max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border-color)] p-5 shadow-2xl md:p-7"
        >
          {/* HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.18em] text-red-400">
                INTERVIEW DETAILS
              </span>

              <h2 className="mt-2 text-xl font-bold">
                {session.role}
              </h2>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {session.date} · {session.time}
              </p>
            </div>

            <button
              type="button"
              onClick={onX}
              className="rounded-xl p-2 transition hover:bg-[var(--bg-glass-hover)]"
              aria-label="X Close"
            >
              <X size={19} />
            </button>
          </div>

          {/* SESSION INFORMATION */}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Type", session.type],
              ["Difficulty", session.difficulty],
              ["Duration", session.duration],
              ["Questions", `${session.answered}/${session.questions}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] p-3"
              >
                <p className="text-[10px] text-[var(--text-muted)]">
                  {label}
                </p>
                <p className="mt-2 text-xs font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* SCORE */}

          <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                SESSION SCORE
              </p>

              <StatusBadge status={session.status} />
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold">
                {session.score || "--"}
              </span>
              <span className="mb-1 text-xs text-[var(--text-muted)]">
                {session.score ? "/ 100" : "Not evaluated"}
              </span>
            </div>

            {session.score > 0 && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--input-bg)]">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${session.score}%` }}
                />
              </div>
            )}
          </div>

          {/* FEEDBACK */}

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Brain />
              <h3 className="text-sm font-semibold">
                Performance Feedback
              </h3>
            </div>

            <p className="rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] p-4 text-sm leading-7 text-[var(--text-secondary)]">
              {session.feedback}
            </p>
          </div>

          <p className="mt-4 text-[10px] leading-5 text-[var(--text-muted)]">
            This is sample interview data. Actual performance feedback and
            scoring will be generated through the AI evaluation backend.
          </p>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onX}
              className="primary-button rounded-xl px-5 py-3 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// function Brain () {
//   return <Brain  size={17} className="text-red-400" />;
// }

// -----------------------------------------------------
// EMPTY STATE
// -----------------------------------------------------

function EmptyState({ onClear }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--input-bg)] px-5 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <Search size={24} />
      </div>

      <h3 className="text-sm font-semibold">No sessions found</h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[var(--text-muted)]">
        We couldn't find any interview sessions matching your search or
        selected filters.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300"
      >
        <RotateCcw size={13} />
        Clear all filters
      </button>
    </div>
  );
}

// -----------------------------------------------------
// MAIN HISTORY PAGE
// -----------------------------------------------------

export default function HistoryPage() {
  const [sessions, setSessions] = useState(initialSessions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSession, setSelectedSession] = useState(null);

  // FILTERING

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        session.role.toLowerCase().includes(searchValue) ||
        session.type.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "All" || session.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" || session.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sessions, search, typeFilter, statusFilter]);

  // STATISTICS

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed"
  );

  const evaluatedSessions = completedSessions.filter(
    (session) => session.score > 0
  );

  const averageScore = evaluatedSessions.length
    ? Math.round(
        evaluatedSessions.reduce((sum, item) => sum + item.score, 0) /
          evaluatedSessions.length
      )
    : 0;

  const inProgressSessions = sessions.filter(
    (session) => session.status === "In Progress"
  );

  // DELETE

  const deleteSession = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview session?"
    );

    if (!confirmed) return;

    setSessions((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setSelectedSession((previous) =>
      previous?.id === id ? null : previous
    );
  };

  // FILTER RESET

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const hasFilters =
    search || typeFilter !== "All" || statusFilter !== "All";

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-red-400">
            <Brain  size={15} />
            SESSION MANAGEMENT
          </div>

          <h1 className="text-2xl font-bold md:text-3xl">
            Interview <span className="gradient-text">History</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Review your previous sessions, explore your performance and track
            your interview preparation journey.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] px-4 py-3">
          <CalendarDays  className="text-red-400" size={19} />

          <div>
            <p className="text-xs font-semibold">All Sessions</p>
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
              Your practice activity
            </p>
          </div>
        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Interviews"
          value={sessions.length}
          description="All practice sessions"
          icon={Brain }
          color="text-red-400"
        />

        <SummaryCard
          label="Completed Sessions"
          value={completedSessions.length}
          description="Successfully completed"
          icon={CheckCircle}
          color="text-green-500"
        />

        <SummaryCard
          label="In Progress"
          value={inProgressSessions.length}
          description="Sessions not completed"
          icon={CalendarDays}
          color="text-amber-500"
        />

        <SummaryCard
          label="Average Score"
          value={`${averageScore}%`}
          description="Across evaluated sessions"
          icon={TrendingUp}
          color="text-blue-400"
        />
      </div>

      {/* FILTER SECTION */}

      <GlassCard>
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-base font-semibold">
              All Interview Sessions
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Search, filter and manage your interview records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
            {/* SEARCH */}

            <div className="relative xl:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job role or type..."
                className="glass-input !h-11 !pl-10 !py-2.5 text-xs"
              />
            </div>

            {/* TYPE FILTER */}

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="glass-input !h-11 !py-2.5 text-xs sm:w-full xl:w-48"
            >
              <option value="All">All Interview Types</option>
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="System Design">System Design</option>
              <option value="HR / Culture Fit">HR / Culture Fit</option>
            </select>

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="glass-input !h-11 !py-2.5 text-xs sm:w-full xl:w-40"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
        </div>

        {/* FILTER SUMMARY */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ListFilter  size={15} />
            Showing{" "}
            <strong className="text-[var(--text-secondary)]">
              {filteredSessions.length}
            </strong>{" "}
            of {sessions.length} sessions
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300"
            >
              <X size={13} />
              Clear filters
            </button>
          )}
        </div>
      </GlassCard>

      {/* DESKTOP TABLE */}

      <GlassCard className="hidden overflow-hidden !p-0 md:block">
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--input-bg)]">
                  {[
                    "JOB ROLE",
                    "INTERVIEW TYPE",
                    "DATE",
                    "DURATION",
                    "SCORE",
                    "STATUS",
                    "ACTIONS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-[10px] font-semibold tracking-wider text-[var(--text-muted)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredSessions.map((session) => (
                  <motion.tr
                    layout
                    key={session.id}
                    className="border-b border-[var(--border-color)] transition hover:bg-[var(--bg-glass-hover)]"
                  >
                    {/* ROLE */}

                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold">
                        {session.role}
                      </p>

                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                        {session.difficulty}
                      </p>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-5">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {session.type}
                      </span>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-5">
                      <p className="text-xs">{session.date}</p>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                        {session.time}
                      </p>
                    </td>

                    {/* DURATION */}

                    <td className="px-5 py-5 text-xs text-[var(--text-secondary)]">
                      {session.duration}
                    </td>

                    {/* SCORE */}

                    <td className="px-5 py-5">
                      <ScoreBadge score={session.score} />
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-5">
                      <StatusBadge status={session.status} />
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSession(session)}
                          title="View details"
                          aria-label={`View ${session.role} details`}
                          className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSession(session.id)}
                          title="Delete session"
                          aria-label={`Delete ${session.role} session`}
                          className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2  size={17} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState onClear={clearFilters} />
          </div>
        )}
      </GlassCard>

      {/* MOBILE SESSION CARDS */}

      <div className="space-y-3 md:hidden">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <motion.div layout key={session.id}>
              <GlassCard>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {session.role}
                    </h3>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {session.type}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                      {session.difficulty}
                    </p>
                  </div>

                  <ScoreBadge score={session.score} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {session.date}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {session.duration}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3">
                  <StatusBadge status={session.status} />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      aria-label="View session details"
                      className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      aria-label="Delete session"
                      className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2  size={17} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </div>

      {/* FOOTER */}

      <div className="flex flex-col items-center justify-between gap-2 border-t border-[var(--border-color)] pt-4 sm:flex-row">
        <p className="text-center text-[10px] text-[var(--text-muted)]">
          Showing sample interview records for the frontend implementation.
        </p>

        <span className="text-[10px] text-[var(--text-muted)]">
          {sessions.length} total records
        </span>
      </div>

      {/* DETAILS MODAL */}

      {selectedSession && (
        <SessionDetails
          session={selectedSession}
          onX={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
