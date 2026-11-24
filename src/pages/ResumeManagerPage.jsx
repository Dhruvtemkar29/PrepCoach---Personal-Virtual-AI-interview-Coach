import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Refresh,
} from "@mui/icons-material";

import GlassCard from "../components/ui/GlassCard";
import {
  getResumes,
  uploadResumes,
  setActiveResume as apiSetActiveResume,
  deleteResume as apiDeleteResume,
  downloadResume as apiDownloadResume,
} from "../services/resumeService";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [".pdf", ".docx", ".txt"];

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(isoString) {
  if (!isoString) {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapDatabaseResume(item) {
  return {
    id: item.resume_id,
    name: item.file_name,
    role: "Standard Resume",
    size: formatSize(Number(item.file_size) || 0),
    date: formatDate(item.uploaded_at),
    type: (item.file_type || "PDF").toUpperCase(),
    status: item.is_active ? "Active" : "Stored",
    active: Boolean(item.is_active),
    uploadedAt: item.uploaded_at,
  };
}

export default function ResumeManagerPage() {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info' | 'error' | 'success'

  const selected = resumes.find((resume) => resume.id === selectedId);

  // Load resumes from backend API
  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getResumes();
      setResumes(data.map(mapDatabaseResume));
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setMessage(error.message || "Failed to load resumes.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

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

  const uploadFiles = async (fileList) => {
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

    if (errors.length) {
      setMessage(errors.join(" "));
      setMessageType("error");
      return;
    }

    if (acceptedFiles.length > 0) {
      try {
        setUploading(true);
        setMessage("Uploading resume(s)...");
        setMessageType("info");

        const result = await uploadResumes(acceptedFiles);
        setMessage(
          result.message ||
            `${acceptedFiles.length} resume(s) uploaded successfully.`
        );
        setMessageType("success");
        await loadResumes();
      } catch (err) {
        setMessage(err.message || "Failed to upload resume(s).");
        setMessageType("error");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  // ---------------------------------------------------
  // ACTIVE RESUME
  // ---------------------------------------------------

  const handleSetActive = async (id) => {
    try {
      setActionId(id);
      await apiSetActiveResume(id);
      setMessage("Active resume updated successfully.");
      setMessageType("success");
      setResumes((previous) =>
        previous.map((resume) => ({
          ...resume,
          active: resume.id === id,
          status: resume.id === id ? "Active" : "Stored",
        }))
      );
    } catch (err) {
      setMessage(err.message || "Failed to set active resume.");
      setMessageType("error");
    } finally {
      setActionId(null);
    }
  };

  // ---------------------------------------------------
  // DELETE RESUME
  // ---------------------------------------------------

  const handleDelete = async (id) => {
    try {
      setActionId(id);
      await apiDeleteResume(id);
      setMessage("Resume removed from your library.");
      setMessageType("success");
      if (selectedId === id) {
        setSelectedId(null);
      }
      await loadResumes();
    } catch (err) {
      setMessage(err.message || "Failed to delete resume.");
      setMessageType("error");
    } finally {
      setActionId(null);
    }
  };

  // ---------------------------------------------------
  // DOWNLOAD RESUME
  // ---------------------------------------------------

  const handleDownload = async (resume) => {
    try {
      setMessage(`Downloading ${resume.name}...`);
      setMessageType("info");
      await apiDownloadResume(resume.id, resume.name);
      setMessage("Download ready.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to download resume file.");
      setMessageType("error");
    }
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
      value: resumes.length,
      icon: <CloudUpload />,
      detail: "Synced with server",
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
            <span className="font-semibold tracking-wide">RESUME CENTER</span>
          </div>

          <h1 className="font-sora text-2xl font-bold sm:text-3xl">
            Resume Manager
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Organize your resumes and manage the documents used for interview
            preparation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadResumes}
            disabled={loading}
            title="Refresh resume list"
            aria-label="Refresh"
            className="flex items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] p-3 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)] disabled:opacity-50"
          >
            <Refresh
              fontSize="small"
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="primary-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            <Add fontSize="small" />
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
        </div>
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
          <h2 className="font-sora text-lg font-bold">Upload a Resume</h2>

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
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            uploadFiles(event.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragging
              ? "border-[var(--accent)] bg-[var(--accent)]/5"
              : "border-[var(--border-color)] bg-[var(--input-bg)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            multiple
            className="hidden"
            onChange={(event) => uploadFiles(event.target.files)}
          />

          <div className="mb-3 rounded-2xl bg-[var(--accent)]/10 p-4 text-[var(--accent)]">
            <CloudUpload sx={{ fontSize: 32 }} />
          </div>

          <h3 className="font-sora font-semibold">
            Drag and drop your resume files here
          </h3>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            PDF, DOCX or TXT files up to 5 MB each.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="secondary-button mt-4 rounded-xl px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Browse Local Files"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-xs ${
              messageType === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : messageType === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-[var(--border-color)] bg-[var(--glass-bg)] text-[var(--text-secondary)]"
            }`}
          >
            {message}
          </div>
        )}
      </GlassCard>

      {/* RESUME LIST SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sora text-lg font-bold">Uploaded Documents</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Choose which resume to use during practice sessions.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 sm:w-72">
            <Search
              fontSize="small"
              className="text-[var(--text-secondary)]"
            />
            <input
              type="text"
              placeholder="Search resumes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-xs outline-none"
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
          {loading ? (
            <GlassCard className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Loading your resume library...
              </p>
            </GlassCard>
          ) : filteredResumes.length === 0 ? (
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
                      <h3 className="break-all font-semibold">{resume.name}</h3>

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
                    onClick={() => handleDownload(resume)}
                    title="Download"
                    aria-label={`Download ${resume.name}`}
                    className="rounded-lg border border-[var(--border-color)] p-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Download fontSize="small" />
                  </button>

                  <button
                    onClick={() => handleSetActive(resume.id)}
                    disabled={resume.active || actionId === resume.id}
                    title={resume.active ? "Active resume" : "Set as active"}
                    aria-label={`Set ${resume.name} as active`}
                    className={`rounded-lg border p-2 transition ${
                      resume.active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border-color)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    <Star fontSize="small" />
                  </button>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={actionId === resume.id}
                    title="Delete resume"
                    aria-label={`Delete ${resume.name}`}
                    className="rounded-lg border border-[var(--border-color)] p-2 text-red-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Delete fontSize="small" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

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
                Resume parsing, skill extraction, job-description matching, and
                personalized improvement suggestions will be connected via the
                AI service layer.
              </p>
            </div>
          </div>

          <span className="w-fit shrink-0 rounded-full border border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            AI Service Stage
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
                  <h3 className="break-all font-semibold">{selected.name}</h3>

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

                    <span className="text-right font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                This panel displays document metadata stored in MySQL.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {!selected.active && (
                  <button
                    onClick={() => {
                      handleSetActive(selected.id);
                      setSelectedId(null);
                    }}
                    className="primary-button flex-1 rounded-xl py-3 text-sm font-semibold"
                  >
                    Set as Active
                  </button>
                )}

                <button
                  onClick={() => handleDownload(selected)}
                  className="secondary-button flex-1 rounded-xl py-3 text-sm font-semibold"
                >
                  <Download fontSize="small" className="mr-2 align-middle" />
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
