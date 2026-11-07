
import { useEffect, useMemo, useState } from "react";
import {
  Add,
  Delete,
  Download,
  Description,
  Person,
  School,
  Work,
  Code,
  EmojiEvents,
  Language,
  LocationOnOutlined,
  EmailOutlined,
  PhoneOutlined,
  Link as LinkIcon,
  Visibility,
  Edit,
  CheckCircle,
  AutoAwesome,
  Print,
  ArrowForward,
} from "@mui/icons-material";

const initialResume = {
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  education: [
    {
      degree: "",
      institution: "",
      location: "",
      start: "",
      end: "",
      score: "",
    },
  ],
  experience: [
    {
      company: "",
      role: "",
      location: "",
      start: "",
      end: "",
      description: "",
    },
  ],
  projects: [
    {
      name: "",
      technologies: "",
      description: "",
      link: "",
    },
  ],
  skills: {
    languages: "",
    frameworks: "",
    databases: "",
    tools: "",
  },
  certifications: [""],
  achievements: [""],
  languages: [""],
  activities: [""],
};

const sections = [
  { id: "personal", label: "Personal Details", icon: Person },
  { id: "summary", label: "Professional Summary", icon: Description },
  { id: "education", label: "Education", icon: School },
  { id: "experience", label: "Experience & Internships", icon: Work },
  { id: "projects", label: "Projects", icon: Code },
  { id: "skills", label: "Technical Skills", icon: AutoAwesome },
  { id: "certifications", label: "Certifications", icon: Description },
  { id: "achievements", label: "Achievements", icon: EmojiEvents },
  { id: "languages", label: "Languages", icon: Language },
  { id: "activities", label: "Activities", icon: EmojiEvents },
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 3,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="glass-input w-full resize-y !text-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="glass-input w-full !text-sm"
        />
      )}
    </label>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <section
      id={`builder-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      className="glass-card scroll-mt-28 rounded-2xl p-5 md:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-[#ff5555]">
            <Icon />
          </div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-[#ff5555] transition-colors hover:bg-red-500/10"
    >
      <Add sx={{ fontSize: 17 }} />
      {label}
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
      title="Remove item"
      aria-label="Remove item"
    >
      <Delete fontSize="small" />
    </button>
  );
}

function ResumeBuilderPage() {
  const [resume, setResume] = useState(() => {
    try {
      const saved = localStorage.getItem("prepcoach-resume-draft");

      if (!saved) return initialResume;

      const parsed = JSON.parse(saved);

      return {
        ...initialResume,
        ...parsed,
        personal: {
          ...initialResume.personal,
          ...parsed.personal,
        },
        skills: {
          ...initialResume.skills,
          ...parsed.skills,
        },
        education: Array.isArray(parsed.education)
          ? parsed.education
          : initialResume.education,
        experience: Array.isArray(parsed.experience)
          ? parsed.experience
          : initialResume.experience,
        projects: Array.isArray(parsed.projects)
          ? parsed.projects
          : initialResume.projects,
        certifications: Array.isArray(parsed.certifications)
          ? parsed.certifications
          : initialResume.certifications,
        achievements: Array.isArray(parsed.achievements)
          ? parsed.achievements
          : initialResume.achievements,
        languages: Array.isArray(parsed.languages)
          ? parsed.languages
          : initialResume.languages,
        activities: Array.isArray(parsed.activities)
          ? parsed.activities
          : initialResume.activities,
      };
    } catch {
      return initialResume;
    }
  });

  useEffect(() => {
    localStorage.setItem("prepcoach-resume-draft", JSON.stringify(resume));
  }, [resume]);
  const [activeTab, setActiveTab] = useState("editor");
  const [activeSection, setActiveSection] = useState("personal");

  const updateField = (section, field, value) => {
    setResume((prev) => {
      // Summary is a string, not an object.
      if (section === "summary") {
        return {
          ...prev,
          summary: value,
        };
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const updateArrayItem = (section, index, field, value) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index
          ? typeof item === "object"
            ? { ...item, [field]: value }
            : value
          : item
      ),
    }));
  };

  const addArrayItem = (section, template) => {
    setResume((prev) => ({
      ...prev,
      [section]: [...prev[section], template],
    }));
  };

  const removeArrayItem = (section, index) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const completion = useMemo(() => {
    const p = resume.personal;

    const checks = [
      Boolean(p.name.trim()),
      Boolean(p.email.trim()),
      Boolean(p.phone.trim()),
      Boolean(p.title.trim()),
      Boolean(resume.summary.trim()),
      resume.education.some((e) => e.degree.trim() && e.institution.trim()),
      resume.experience.some((e) => e.role.trim() && e.company.trim()),
      resume.projects.some((p) => p.name.trim() && p.description.trim()),
      Object.values(resume.skills).some((s) => s.trim()),
      resume.certifications.some((s) => s.trim()),
      resume.achievements.some((s) => s.trim()),
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [resume]);

  const filledContact = Boolean(
    resume.personal.name &&
    resume.personal.email &&
    resume.personal.phone
  );

  const atsChecks = [
    { label: "Professional contact information", done: filledContact },
    { label: "Professional summary", done: Boolean(resume.summary.trim()) },
    {
      label: "Education details",
      done: resume.education.some((e) => e.degree && e.institution),
    },
    {
      label: "Relevant experience",
      done: resume.experience.some((e) => e.role && e.company),
    },
    {
      label: "Project descriptions",
      done: resume.projects.some((p) => p.name && p.description),
    },
    {
      label: "Technical skills",
      done: Object.values(resume.skills).some((s) => s.trim()),
    },
  ];

  const printResume = () => {
    if (activeTab !== "preview") {
      setActiveTab("preview");

      window.setTimeout(() => {
        window.print();
      }, 400);
    } else {
      window.print();
    }
  };

  const navigateSection = (id) => {
    const sectionTitles = {
      personal: "Personal Details",
      summary: "Professional Summary",
      education: "Education",
      experience: "Experience & Internships",
      projects: "Projects",
      skills: "Technical Skills",
      certifications: "Certifications",
      achievements: "Achievements",
      languages: "Languages",
      activities: "Extracurricular Activities",
    };

    const title = sectionTitles[id];

    if (!title) return;

    setActiveSection(id);
    setActiveTab("editor");

    requestAnimationFrame(() => {
      document
        .getElementById(
          `builder-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  useEffect(() => {
    if (activeTab !== "editor") return;

    const sectionTitles = {
      personal: "Personal Details",
      summary: "Professional Summary",
      education: "Education",
      experience: "Experience & Internships",
      projects: "Projects",
      skills: "Technical Skills",
      certifications: "Certifications",
      achievements: "Achievements",
      languages: "Languages",
      activities: "Extracurricular Activities",
    };

    const handleScroll = () => {
      let currentSection = "personal";

      sections.forEach((section) => {
        const title = sectionTitles[section.id];
        const element = document.getElementById(
          `builder-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        );

        if (element && element.getBoundingClientRect().top <= 180) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeTab]);

  return (
    <div className="resume-builder-page space-y-6">

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
            color: #111 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .resume-print-area,
          .resume-print-area * {
            visibility: visible !important;
          }

          .resume-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: #111 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .resume-print-area * {
            color: #111 !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          .resume-print-area h1 {
            font-size: 23px !important;
          }

          .resume-print-area h2 {
            font-size: 12px !important;
            border-bottom: 1px solid #333 !important;
            padding-bottom: 4px !important;
            margin-top: 15px !important;
          }

          .resume-print-area p,
          .resume-print-area span {
            font-size: 10px !important;
          }

          .resume-print-area a {
            text-decoration: none !important;
          }

          .resume-no-break {
            break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Workspace</span>
            <ArrowForward sx={{ fontSize: 12 }} />
            <span>Resume Builder</span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            Resume Builder
          </h1>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Build a professional, ATS-friendly resume that highlights your strengths.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass-hover)]"
          >
            <Visibility sx={{ fontSize: 17 }} />
            Preview
          </button>

          <button
            onClick={printResume}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#b91c1c] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:brightness-110"
          >
            <Download sx={{ fontSize: 17 }} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Resume completeness
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Complete the sections below to build your resume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--bg-glass-hover)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-lg font-bold tabular-nums text-[#ff5555]">
              {completion}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === "editor"
            ? "border-[#ff5555] text-[#ff5555]"
            : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
        >
          <Edit sx={{ fontSize: 17 }} />
          Edit Resume
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === "preview"
            ? "border-[#ff5555] text-[#ff5555]"
            : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
        >
          <Visibility sx={{ fontSize: 17 }} />
          Live Preview
        </button>
      </div>

      {/* Editor */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

          <div className="space-y-5">

            {/* Personal Details */}
            <SectionCard title="Personal Details" icon={Person}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name *"
                  value={resume.personal.name}
                  onChange={(v) => updateField("personal", "name", v)}
                  placeholder="Your full name"
                />

                <Field
                  label="Professional Title"
                  value={resume.personal.title}
                  onChange={(v) => updateField("personal", "title", v)}
                  placeholder="e.g. Software Developer"
                />

                <Field
                  label="Email Address *"
                  value={resume.personal.email}
                  onChange={(v) => updateField("personal", "email", v)}
                  placeholder="you@example.com"
                  type="email"
                />

                <Field
                  label="Phone Number *"
                  value={resume.personal.phone}
                  onChange={(v) => updateField("personal", "phone", v)}
                  placeholder="+91 98765 43210"
                />

                <Field
                  label="Location"
                  value={resume.personal.location}
                  onChange={(v) => updateField("personal", "location", v)}
                  placeholder="City, Country"
                />

                <Field
                  label="LinkedIn URL"
                  value={resume.personal.linkedin}
                  onChange={(v) => updateField("personal", "linkedin", v)}
                  placeholder="linkedin.com/in/username"
                />

                <Field
                  label="GitHub URL"
                  value={resume.personal.github}
                  onChange={(v) => updateField("personal", "github", v)}
                  placeholder="github.com/username"
                />

                <Field
                  label="Portfolio URL"
                  value={resume.personal.portfolio}
                  onChange={(v) => updateField("personal", "portfolio", v)}
                  placeholder="yourportfolio.com"
                />
              </div>
              <p className="mt-3 text-[10px] text-[var(--text-muted)]">
                * Required fields for your contact section.
              </p>
            </SectionCard>

            {/* Summary */}
            <SectionCard title="Professional Summary" icon={Description}>
              <Field
                label="About You"
                value={resume.summary}
                onChange={(v) => updateField("summary", "", v)}
                placeholder="Write 3–5 sentences describing your background, key skills, experience and career goals..."
                multiline
                rows={5}
              />
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                Tip: Focus on relevant skills, experience and achievements instead of generic statements.
              </p>
            </SectionCard>

            {/* Education */}
            <SectionCard
              title="Education"
              icon={School}
              action={
                <AddButton
                  label="Add Education"
                  onClick={() =>
                    addArrayItem("education", {
                      degree: "",
                      institution: "",
                      location: "",
                      start: "",
                      end: "",
                      score: "",
                    })
                  }
                />
              }
            >
              <div className="space-y-5">
                {resume.education.map((item, index) => (
                  <div key={index} className="relative rounded-xl border border-[var(--border-color)] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Education {index + 1}
                      </p>
                      {resume.education.length > 1 && (
                        <RemoveButton onClick={() => removeArrayItem("education", index)} />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Degree / Course"
                        value={item.degree}
                        onChange={(v) => updateArrayItem("education", index, "degree", v)}
                        placeholder="e.g. MSc Artificial Intelligence"
                      />
                      <Field
                        label="Institution"
                        value={item.institution}
                        onChange={(v) => updateArrayItem("education", index, "institution", v)}
                        placeholder="University / College"
                      />
                      <Field
                        label="Location"
                        value={item.location}
                        onChange={(v) => updateArrayItem("education", index, "location", v)}
                        placeholder="City"
                      />
                      <Field
                        label="CGPA / Percentage"
                        value={item.score}
                        onChange={(v) => updateArrayItem("education", index, "score", v)}
                        placeholder="e.g. 8.48 CGPA"
                      />
                      <Field
                        label="Start Date"
                        value={item.start}
                        onChange={(v) => updateArrayItem("education", index, "start", v)}
                        placeholder="2024"
                      />
                      <Field
                        label="End Date"
                        value={item.end}
                        onChange={(v) => updateArrayItem("education", index, "end", v)}
                        placeholder="2026"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Experience */}
            <SectionCard
              title="Experience & Internships"
              icon={Work}
              action={
                <AddButton
                  label="Add Experience"
                  onClick={() =>
                    addArrayItem("experience", {
                      company: "",
                      role: "",
                      location: "",
                      start: "",
                      end: "",
                      description: "",
                    })
                  }
                />
              }
            >
              <div className="space-y-5">
                {resume.experience.map((item, index) => (
                  <div key={index} className="rounded-xl border border-[var(--border-color)] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Experience {index + 1}
                      </p>
                      {resume.experience.length > 1 && (
                        <RemoveButton onClick={() => removeArrayItem("experience", index)} />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Job Title / Role"
                        value={item.role}
                        onChange={(v) => updateArrayItem("experience", index, "role", v)}
                        placeholder="Frontend Developer Intern"
                      />
                      <Field
                        label="Company"
                        value={item.company}
                        onChange={(v) => updateArrayItem("experience", index, "company", v)}
                        placeholder="Company name"
                      />
                      <Field
                        label="Location"
                        value={item.location}
                        onChange={(v) => updateArrayItem("experience", index, "location", v)}
                        placeholder="City / Remote"
                      />
                      <Field
                        label="Start Date"
                        value={item.start}
                        onChange={(v) =>
                          updateArrayItem("experience", index, "start", v)
                        }
                        placeholder="Jan 2025"
                      />

                      <Field
                        label="End Date"
                        value={item.end}
                        onChange={(v) =>
                          updateArrayItem("experience", index, "end", v)
                        }
                        placeholder="Present / Dec 2025"
                      />
                    </div>

                    <div className="mt-4">
                      <Field
                        label="Responsibilities & Achievements"
                        value={item.description}
                        onChange={(v) => updateArrayItem("experience", index, "description", v)}
                        placeholder="Describe your responsibilities, contributions and measurable results. Use separate lines for bullet points."
                        multiline
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Projects */}
            <SectionCard
              title="Projects"
              icon={Code}
              action={
                <AddButton
                  label="Add Project"
                  onClick={() =>
                    addArrayItem("projects", {
                      name: "",
                      technologies: "",
                      description: "",
                      link: "",
                    })
                  }
                />
              }
            >
              <div className="space-y-5">
                {resume.projects.map((item, index) => (
                  <div key={index} className="rounded-xl border border-[var(--border-color)] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Project {index + 1}
                      </p>
                      {resume.projects.length > 1 && (
                        <RemoveButton onClick={() => removeArrayItem("projects", index)} />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Project Name"
                        value={item.name}
                        onChange={(v) => updateArrayItem("projects", index, "name", v)}
                        placeholder="Project title"
                      />
                      <Field
                        label="Technologies Used"
                        value={item.technologies}
                        onChange={(v) => updateArrayItem("projects", index, "technologies", v)}
                        placeholder="React, Node.js, Python..."
                      />
                      <div className="sm:col-span-2">
                        <Field
                          label="Project Description"
                          value={item.description}
                          onChange={(v) => updateArrayItem("projects", index, "description", v)}
                          placeholder="Explain the problem, solution, your contribution and outcome."
                          multiline
                          rows={3}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Field
                          label="Project Link (Optional)"
                          value={item.link}
                          onChange={(v) => updateArrayItem("projects", index, "link", v)}
                          placeholder="GitHub / Live demo URL"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Skills */}
            <SectionCard title="Technical Skills" icon={AutoAwesome}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Programming Languages"
                  value={resume.skills.languages}
                  onChange={(v) => updateField("skills", "languages", v)}
                  placeholder="Python, Java, JavaScript, C++"
                  multiline
                />
                <Field
                  label="Frameworks & Libraries"
                  value={resume.skills.frameworks}
                  onChange={(v) => updateField("skills", "frameworks", v)}
                  placeholder="React, Angular, Node.js, TensorFlow"
                  multiline
                />
                <Field
                  label="Databases"
                  value={resume.skills.databases}
                  onChange={(v) => updateField("skills", "databases", v)}
                  placeholder="MySQL, MongoDB, PostgreSQL"
                  multiline
                />
                <Field
                  label="Tools & Platforms"
                  value={resume.skills.tools}
                  onChange={(v) => updateField("skills", "tools", v)}
                  placeholder="Git, GitHub, VS Code, Docker"
                  multiline
                />
              </div>
              <p className="mt-3 text-[10px] text-[var(--text-muted)]">
                Separate individual skills with commas.
              </p>
            </SectionCard>

            {/* Certifications */}
            {[
              { key: "certifications", title: "Certifications", icon: Description },
              { key: "achievements", title: "Achievements", icon: EmojiEvents },
              { key: "languages", title: "Languages", icon: Language },
              { key: "activities", title: "Extracurricular Activities", icon: EmojiEvents },
            ].map(({ key, title, icon }) => (
              <SectionCard
                key={key}
                title={title}
                icon={icon}
                action={
                  <AddButton
                    label="Add"
                    onClick={() => addArrayItem(key, "")}
                  />
                }
              >
                <div className="space-y-3">
                  {resume[key].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateArrayItem(key, index, null, e.target.value)}
                        placeholder={
                          key === "certifications"
                            ? "Certification name – Issuing organization"
                            : key === "achievements"
                              ? "Describe your achievement"
                              : key === "languages"
                                ? "e.g. English – Fluent"
                                : "Activity / Leadership role"
                        }
                        className="glass-input min-w-0 flex-1 !text-sm"
                      />

                      {resume[key].length > 1 && (
                        <RemoveButton onClick={() => removeArrayItem(key, index)} />
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">

            {/* Section Navigation */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="mb-4 text-sm font-bold text-[var(--text-primary)]">
                Resume Sections
              </h3>

              <div className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      onClick={() => navigateSection(section.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${activeSection === section.id
                        ? "bg-red-500/10 font-semibold text-[#ff5555]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)]"
                        }`}
                    >
                      <Icon sx={{ fontSize: 17 }} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ATS Checklist */}
            <div className="glass-card rounded-2xl p-4">
              <div className="mb-4 flex items-center gap-2">
                <AutoAwesome className="text-[#ff5555]" fontSize="small" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  ATS Checklist
                </h3>
              </div>

              <div className="space-y-3">
                {atsChecks.map((check) => (
                  <div key={check.label} className="flex items-start gap-2">
                    <CheckCircle
                      sx={{
                        fontSize: 16,
                        color: check.done ? "#22c55e" : "var(--text-muted)",
                        mt: "1px",
                      }}
                    />
                    <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                      {check.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 border-t border-[var(--border-color)] pt-3 text-[10px] leading-relaxed text-[var(--text-muted)]">
                This checklist checks whether key sections contain information. It is not a real ATS score or a guarantee of passing an applicant tracking system.
              </p>
            </div>

            {/* Export */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/15 to-transparent p-4">
              <div className="mb-3 flex items-center gap-2 text-[#ff5555]">
                <Download fontSize="small" />
                <span className="text-xs font-bold">READY TO EXPORT?</span>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-[var(--text-secondary)]">
                Preview your resume and print it or save it as a PDF.
              </p>

              <button
                onClick={printResume}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e93636] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#d52b2b]"
              >
                <Print sx={{ fontSize: 16 }} />
                Print / Save PDF
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Resume Preview */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Resume Preview
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Clean, single-column resume layout.
              </p>
            </div>

            <button
              onClick={printResume}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#b91c1c] px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Download sx={{ fontSize: 17 }} />
              Export PDF
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#e5e7eb] p-3 sm:p-6">
            <div className="resume-print-area mx-auto min-h-[1050px] w-full max-w-[794px] bg-white p-6 text-[#222] shadow-xl sm:p-12">

              {/* Personal Header */}
              <div className="border-b-2 border-[#333] pb-4 text-center">
                <h1 className="text-3xl font-bold tracking-wide text-[#171717]">
                  {resume.personal.name || "YOUR NAME"}
                </h1>

                {resume.personal.title && (
                  <p className="mt-1 text-sm font-semibold text-[#444]">
                    {resume.personal.title}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-[#444]">
                  {resume.personal.email && (
                    <span>{resume.personal.email}</span>
                  )}
                  {resume.personal.phone && (
                    <span>{resume.personal.phone}</span>
                  )}
                  {resume.personal.location && (
                    <span>{resume.personal.location}</span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-[#444]">
                  {resume.personal.linkedin && <span>{resume.personal.linkedin}</span>}
                  {resume.personal.github && <span>{resume.personal.github}</span>}
                  {resume.personal.portfolio && <span>{resume.personal.portfolio}</span>}
                </div>
              </div>

              {/* Summary */}
              {resume.summary.trim() && (
                <div className="resume-no-break">
                  <h2 className="mb-2 mt-5 border-b border-[#555] pb-1 text-sm font-bold uppercase tracking-wide text-[#222]">
                    Professional Summary
                  </h2>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-[#333]">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {resume.education.some((e) => e.degree || e.institution) && (
                <div>
                  <h2 className="mb-2 mt-5 border-b border-[#555] pb-1 text-sm font-bold uppercase tracking-wide text-[#222]">
                    Education
                  </h2>

                  {resume.education.map((item, index) =>
                    item.degree || item.institution ? (
                      <div key={index} className="resume-no-break mb-3">
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className="text-xs font-bold text-[#222]">
                            {item.degree}
                          </p>
                          <p className="text-[11px] text-[#444]">
                            {[item.start, item.end].filter(Boolean).join(" – ")}
                          </p>
                        </div>
                        <p className="text-xs text-[#333]">
                          {item.institution}
                          {item.location ? `, ${item.location}` : ""}
                        </p>
                        {item.score && (
                          <p className="mt-1 text-[11px] text-[#444]">
                            CGPA / Percentage: {item.score}
                          </p>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Experience */}
              {resume.experience.some((e) => e.role || e.company) && (
                <div>
                  <h2 className="mb-2 mt-5 border-b border-[#555] pb-1 text-sm font-bold uppercase tracking-wide text-[#222]">
                    Experience
                  </h2>

                  {resume.experience.map((item, index) =>
                    item.role || item.company ? (
                      <div key={index} className="resume-no-break mb-3">
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className="text-xs font-bold text-[#222]">
                            {item.role}
                          </p>
                          <p className="text-[11px] text-[#444]">
                            {[item.start, item.end].filter(Boolean).join(" – ")}
                          </p>
                        </div>

                        <p className="text-xs italic text-[#444]">
                          {item.company}
                          {item.location ? `, ${item.location}` : ""}
                        </p>

                        {item.description && (
                          <ul className="mt-1 list-disc space-y-1 pl-5">
                            {item.description.split("\n").filter(Boolean).map((line, i) => (
                              <li key={i} className="text-[11px] leading-relaxed text-[#333]">
                                {line.replace(/^[-•*]\s*/, "")}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Projects */}
              {resume.projects.some((p) => p.name || p.description) && (
                <div>
                  <h2 className="mb-2 mt-5 border-b border-[#555] pb-1 text-sm font-bold uppercase tracking-wide text-[#222]">
                    Projects
                  </h2>

                  {resume.projects.map((item, index) =>
                    item.name || item.description ? (
                      <div key={index} className="resume-no-break mb-3">
                        <p className="text-xs font-bold text-[#222]">
                          {item.name}
                        </p>
                        {item.technologies && (
                          <p className="text-[11px] italic text-[#444]">
                            Technologies: {item.technologies}
                          </p>
                        )}
                        {item.description && (
                          <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-[#333]">
                            {item.description}
                          </p>
                        )}
                        {item.link && (
                          <p className="mt-1 text-[11px] text-[#444]">
                            {item.link}
                          </p>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Skills */}
              {Object.values(resume.skills).some((s) => s.trim()) && (
                <div>
                  <h2 className="mb-2 mt-5 border-b border-[#555] pb-1 text-sm font-bold uppercase tracking-wide text-[#222]">
                    Technical Skills
                  </h2>

                  {[
                    ["Programming Languages", resume.skills.languages],
                    ["Frameworks & Libraries", resume.skills.frameworks],
                    ["Databases", resume.skills.databases],
                    ["Tools & Platforms", resume.skills.tools],
                  ].map(([label, value]) =>
                    value.trim() ? (
                      <p key={label} className="mb-1 text-[11px] text-[#333]">
                        <strong>{label}:</strong> {value}
                      </p>
                    ) : null
                  )}
                </div>
              )}

              {/* Other Sections */}
              {[
                ["Certifications", resume.certifications],
                ["Achievements", resume.achievements],
                ["Languages", resume.languages],
                ["Extracurricular Activities", resume.activities],
              ].map(([title, items]) => {
                const filled = items.filter((item) => item.trim());

                if (!filled.length) return null;

                return (
                  <div key={title}>
                    <h2 className="mb-2 mt-5 border-b border-[#555] pb-1 text-sm font-bold uppercase tracking-wide text-[#222]">
                      {title}
                    </h2>

                    <ul className="list-disc space-y-1 pl-5">
                      {filled.map((item, index) => (
                        <li key={index} className="text-[11px] leading-relaxed text-[#333]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-[10px] text-[var(--text-muted)] no-print">
            Use Export PDF and select Save as PDF in your browser's print dialog.
          </p>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilderPage;
