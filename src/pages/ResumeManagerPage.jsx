
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  Description,
  CloudUpload,
  Search,
  Add,
  Delete,
  Visibility,
  Download,
  Close,
  CheckCircle,
  InsertDriveFile,
  Star,
  AutoAwesome,
  FolderOpen,
  PictureAsPdf,
} from "@mui/icons-material";

import GlassCard from "../components/ui/GlassCard";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [".pdf", ".docx", ".txt"];

const initialResumes = [
  {
    id: 1,
    name: "Software_Developer_Resume.pdf",
    role: "Software Developer",
    size: "245 KB",
    date: "28 Oct 2026",
    type: "PDF",
    status: "Sample",
    active: true,
    file: null,
  },
  {
    id: 2,
    name: "Frontend_Developer_CV.pdf",
    role: "Frontend Developer",
    size: "182 KB",
    date: "24 Oct 2026",
    type: "PDF",
    status: "Sample",
    active: false,
    file: null,
  },
];

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ResumeManagerPage() {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState(initialResumes);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");

  const selected = resumes.find((resume) => resume.id === selectedId);

  // Close modal using Escape key
  useEffect(() => {
    if (!selectedId) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId]);

  // Search by filename, target role or file type
  const filteredResumes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return resumes;

    return resumes.filter((resume) =>
      [resume.name, resume.role, resume.type]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [resumes, search]);

  // ---------------------------------------------------
  // UPLOAD RESUMES
  // ---------------------------------------------------

  const uploadFiles = (fileList) => {
    const incomingFiles = Array.from(fileList || []);

    if (!incomingFiles.length) return;

    setMessage("");

    const acceptedFiles = [];
    const errors = [];

    incomingFiles.forEach((file) => {
      const extension = `.${file.name.split(".").pop().toLowerCase()}`;

      if (!ACCEPTED_TYPES.includes(extension)) {
        errors.push(`${file.name}: Unsupported format.`);
        return;
      }

      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: File exceeds the 5 MB limit.`);
        return;
      }

      if (file.size === 0) {
        errors.push(`${file.name}: Empty files cannot be uploaded.`);
        return;
      }

      acceptedFiles.push(file);
    });

    if (acceptedFiles.length > 0) {
      setResumes((previous) => {
        const alreadyHasActive = previous.some((item) => item.active);

        const newResumes = acceptedFiles.map((file, index) => {
          const extension = file.name.split(".").pop().toUpperCase();

          return {
            id: `${Date.now()}-${index}-${Math.random()}`,
            name: file.name,
            role: "Not specified",
            size: formatSize(file.size),
            date: formatDate(),
            type: extension,
            status: "Uploaded",
            active: !alreadyHasActive && index === 0,
            file,
          };
        });

        return [...newResumes, ...previous];
      });
    }

    setMessage(
      errors.length
        ? errors.join(" ")
        : `${acceptedFiles.length} resume${acceptedFiles.length > 1 ? "s" : ""} uploaded successfully.`
    );
  };

  // ---------------------------------------------------
  // ACTIVE RESUME
  // ---------------------------------------------------

  const setActiveResume = (id) => {
    setResumes((previous) =>
      previous.map((resume) => ({
        ...resume,
        active: resume.id === id,
      }))
    );

    setMessage("Active resume updated successfully.");
  };

  // ---------------------------------------------------
  // DELETE RESUME
  // ---------------------------------------------------

  const deleteResume = (id) => {
    setResumes((previous) => {
      const deletedResume = previous.find((item) => item.id === id);

      let remaining = previous.filter((item) => item.id !== id);

      if (deletedResume?.active && remaining.length > 0) {
        remaining = remaining.map((item, index) => ({
          ...item,
          active: index === 0,
        }));
      }

      return remaining;
    });

    if (selectedId === id) {
      setSelectedId(null);
    }

    setMessage("Resume removed from your library.");
  };

  // ---------------------------------------------------
  // DOWNLOAD RESUME
  // ---------------------------------------------------

  const downloadResume = (resume) => {
    if (!resume.file) {
      setMessage(
        "This is sample data. Upload a real resume to download it."
      );
      return;
    }

    const url = URL.createObjectURL(resume.file);
    const link = document.createElement("a");

    link.href = url;
    link.download = resume.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ---------------------------------------------------
  // SUMMARY DATA
  // ---------------------------------------------------

  const summary = [
    {
      label: "Total Resumes",
      value: resumes.length,
      icon: <FolderOpen />,
      detail: "Documents in your library",
    },
    {
      label: "Active Resume",
      value: resumes.filter((resume) => resume.active).length,
      icon: <Star />,
      detail: "Selected for practice",
    },
    {
      label: "Uploaded Files",
      value: resumes.filter((resume) => resume.file).length,
      icon: <CloudUpload />,
      detail: "Added in this session",
    },
    {
      label: "Supported Formats",
      value: "03",
      icon: <Description />,
      detail: "PDF, DOCX and TXT",
    },
  ];

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------

  return (
    <div className="space-y-7 pb-10">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--accent)]">
            <Description fontSize="small" />
            <span className="font-semibold tracking-wide">
              RESUME CENTER
            </span>
          </div>

          <h1 className="font-sora text-2xl font-bold sm:text-3xl">
            Resume Manager
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Organize your resumes and manage the documents used
            for interview preparation.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="primary-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Add fontSize="small" />
          Upload Resume
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="dashboard-grid grid gap-4">
        {summary.map((item, index) => (
          <GlassCard key={item.label} delay={index * 0.06}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.label}
                </p>

                <h2 className="mt-2 font-sora text-2xl font-bold">
                  {item.value}
                </h2>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] p-3 text-[var(--accent)]">
                {item.icon}
              </div>
            </div>

            <p className="mt-3 text-xs text-[var(--text-secondary)]">
              {item.detail}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* UPLOAD AREA */}
      <GlassCard>
        <div className="mb-5">
          <h2 className="font-sora text-lg font-bold">
            Upload a Resume
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Add your latest resume to your personal document library.
          </p>
        </div>

        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            uploadFiles(event.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
            dragging
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--glass-bg)]"
          }`}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <CloudUpload sx={{ fontSize: 34 }} />
          </div>

          <h3 className="font-semibold">
            {dragging ? (
              "Drop your files here"
            ) : (
              <>
                Drop your resume here or{" "}
                <span className="text-[var(--accent)]">
                  browse files
                </span>
              </>
            )}
          </h3>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            PDF, DOCX or TXT · Maximum file size 5 MB
          </p>

          <p className="mt-4 text-xs text-[var(--text-secondary)]">
            Your files are currently stored only in this browser session.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          hidden
          onChange={(event) => {
            uploadFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {message && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-3 text-sm text-[var(--accent)]"
          >
            {message}
          </div>
        )}
      </GlassCard>

      {/* RESUME LIBRARY */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sora text-xl font-bold">
              Your Resume Library
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Manage and select your interview documents.
            </p>
          </div>

          <div className="glass-input flex items-center gap-2 rounded-xl px-3 py-2.5 sm:w-72">
            <Search
              className="text-[var(--text-secondary)]"
              fontSize="small"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resumes or roles..."
              aria-label="Search resumes"
              className="w-full bg-transparent text-sm outline-none"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-[var(--text-secondary)] hover:text-[var(--accent)]"
              >
                <Close fontSize="small" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredResumes.length === 0 ? (
            <GlassCard className="py-12 text-center">
              <FolderOpen
                sx={{ fontSize: 42 }}
                className="text-[var(--text-secondary)]"
              />

              <h3 className="mt-3 font-semibold">
                {resumes.length === 0
                  ? "Your resume library is empty"
                  : "No resumes found"}
              </h3>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {resumes.length === 0
                  ? "Upload your first resume to get started."
                  : "Try another search or upload a resume."}
              </p>

              {resumes.length === 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="primary-button mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  Upload Resume
                </button>
              )}
            </GlassCard>
          ) : (
            filteredResumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card flex flex-col gap-4 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  resume.active
                    ? "border-[var(--accent)]/50"
                    : "border-[var(--border-color)]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    {resume.type === "PDF" ? (
                      <PictureAsPdf />
                    ) : (
                      <InsertDriveFile />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-all font-semibold">
                        {resume.name}
                      </h3>

                      {resume.active && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-1 text-[10px] font-bold text-[var(--accent)]">
                          <CheckCircle sx={{ fontSize: 12 }} />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {resume.role}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                      <span>{resume.type}</span>
                      <span>{resume.size}</span>
                      <span>{resume.date}</span>
                      <span>{resume.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => setSelectedId(resume.id)}
                    title="View details"
                    aria-label={`View ${resume.name} details`}
                    className="rounded-lg border border-[var(--border-color)] p-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Visibility fontSize="small" />
                  </button>

                  <button
                    onClick={() => downloadResume(resume)}
                    title="Download"
                    aria-label={`Download ${resume.name}`}
                    className="rounded-lg border border-[var(--border-color)] p-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Download fontSize="small" />
                  </button>

                  {!resume.active && (
                    <button
                      onClick={() => setActiveResume(resume.id)}
                      className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      Set Active
                    </button>
                  )}

                  <button
                    onClick={() => deleteResume(resume.id)}
                    title="Delete"
                    aria-label={`Delete ${resume.name}`}
                    className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-secondary)] transition hover:border-red-500 hover:text-red-500"
                  >
                    <Delete fontSize="small" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* AI RESUME INTELLIGENCE */}
      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
              <AutoAwesome />
            </div>

            <div>
              <h3 className="font-sora text-lg font-bold">
                AI Resume Intelligence
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                Resume parsing, skill extraction, job-description
                matching, and personalized improvement suggestions
                will be connected in the AI backend integration.
              </p>
            </div>
          </div>

          <span className="w-fit shrink-0 rounded-full border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            Backend integration pending
          </span>
        </div>
      </GlassCard>

      {/* RESUME DETAILS MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-details-title"
              className="glass-card my-auto w-full max-w-lg rounded-2xl p-5 sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="resume-details-title"
                  className="font-sora text-lg font-bold"
                >
                  Resume Details
                </h2>

                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Close details"
                  className="rounded-lg p-2 transition hover:bg-[var(--glass-bg)]"
                >
                  <Close />
                </button>
              </div>

              <div className="mb-5 flex items-center gap-4">
                <div className="rounded-xl bg-[var(--accent)]/10 p-4 text-[var(--accent)]">
                  <Description sx={{ fontSize: 30 }} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-all font-semibold">
                    {selected.name}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {selected.type} document
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-[var(--border-color)] p-4">
                {[
                  ["File size", selected.size],
                  ["Uploaded", selected.date],
                  ["Target role", selected.role],
                  ["Status", selected.status],
                  [
                    "Selection",
                    selected.active ? "Active resume" : "Not active",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-[var(--text-secondary)]">
                      {label}
                    </span>

                    <span className="text-right font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                This panel currently displays document metadata.
                Content extraction and AI resume analysis require
                backend integration.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {!selected.active && (
                  <button
                    onClick={() => {
                      setActiveResume(selected.id);
                      setSelectedId(null);
                    }}
                    className="primary-button flex-1 rounded-xl py-3 text-sm font-semibold"
                  >
                    Set as Active
                  </button>
                )}

                <button
                  onClick={() => downloadResume(selected)}
                  className="secondary-button flex-1 rounded-xl py-3 text-sm font-semibold"
                >
                  <Download
                    fontSize="small"
                    className="mr-2 align-middle"
                  />
                  Download
                </button>
              </div>

              <button
                onClick={() => setSelectedId(null)}
                className="mt-3 w-full rounded-xl border border-[var(--border-color)] py-3 text-sm font-semibold transition hover:bg-[var(--glass-bg)]"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
