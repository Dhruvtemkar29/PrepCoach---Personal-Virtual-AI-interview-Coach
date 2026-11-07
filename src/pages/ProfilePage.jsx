
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Person,
  Edit,
  Save,
  Close,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Code,
  Psychology,
  AutoAwesome,
  CheckCircle,
} from "@mui/icons-material";
import GlassCard from "../components/ui/GlassCard";

const STORAGE_KEY = "prepcoach-user-profile";

const initialProfile = {
  name: "Dhruv Temkar",
  email: "dhruv@example.com",
  phone: "",
  location: "Bangalore, India",
  education: "MSc Artificial Intelligence & Machine Learning",
  university: "Christ University",
  experience: "Fresher",
  targetRole: "Software Developer",
  skills: "React, Python, JavaScript, Machine Learning, SQL",
  careerGoal: "Build a career in AI/ML and software development.",
  interviewType: "Technical",
  difficulty: "Intermediate",
};

function getInitialProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return initialProfile;

    const parsed = JSON.parse(saved);

    return {
      ...initialProfile,
      ...parsed,
    };
  } catch {
    return initialProfile;
  }
}

// Reusable input field - kept outside ProfilePage to preserve focus.
function ProfileField({
  label,
  value,
  field,
  icon,
  editing,
  onChange,
  multiline = false,
  type = "text",
}) {
  return (
    <div>
      <label
        htmlFor={`profile-${field}`}
        className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]"
      >
        {label}
      </label>

      {editing ? (
        multiline ? (
          <textarea
            id={`profile-${field}`}
            rows={3}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="glass-input w-full resize-y rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        ) : (
          <div className="glass-input flex items-center gap-3 rounded-xl px-4 py-3 focus-within:border-[var(--accent)]">
            {icon && (
              <span className="text-[var(--text-secondary)]">
                {icon}
              </span>
            )}

            <input
              id={`profile-${field}`}
              type={type}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm outline-none"
            />
          </div>
        )
      ) : (
        <div className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] px-4 py-3">
          {icon && (
            <span className="shrink-0 text-[var(--text-secondary)]">
              {icon}
            </span>
          )}

          <p className="break-words text-sm">
            {value || (
              <span className="text-[var(--text-secondary)]">
                Not provided
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileSelect({
  label,
  value,
  field,
  options,
  editing,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={`profile-${field}`}
        className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]"
      >
        {label}
      </label>

      {editing ? (
        <select
          id={`profile-${field}`}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] px-4 py-3 text-sm">
          {value || "Not provided"}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [originalProfile, setOriginalProfile] = useState(getInitialProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateField = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);

    if (field === "email") {
      setEmailError("");
    }
  };

  const completionFields = [
    profile.name,
    profile.email,
    profile.phone,
    profile.location,
    profile.education,
    profile.university,
    profile.experience,
    profile.targetRole,
    profile.skills,
    profile.careerGoal,
  ];

  const completion = useMemo(() => {
    const completed = completionFields.filter(
      (field) => String(field || "").trim().length > 0
    ).length;

    return Math.round(
      (completed / completionFields.length) * 100
    );
  }, [profile]);

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleEdit = () => {
    setOriginalProfile({ ...profile });
    setEditing(true);
    setSaved(false);
    setEmailError("");
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setEditing(false);
    setEmailError("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    const email = profile.email.trim();

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const updatedProfile = {
      ...profile,
      name: profile.name.trim(),
      email,
      phone: profile.phone.trim(),
      location: profile.location.trim(),
    };

    setProfile(updatedProfile);
    setOriginalProfile(updatedProfile);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );

    setEditing(false);
    setSaved(true);
    setEmailError("");
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--accent)]">
            <Person fontSize="small" />
            PERSONAL WORKSPACE
          </div>

          <h1 className="font-sora text-2xl font-bold sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage your personal information and interview preparation preferences.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="primary-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          >
            <Edit fontSize="small" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="secondary-button flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            >
              <Close fontSize="small" />
              Cancel
            </button>

            <button
              form="profile-form"
              type="submit"
              className="primary-button flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
            >
              <Save fontSize="small" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Save Confirmation */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500"
        >
          <CheckCircle fontSize="small" />
          Profile changes saved successfully in this browser.
        </motion.div>
      )}

      <form
        id="profile-form"
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Profile Overview */}
        <GlassCard>
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 font-sora text-3xl font-bold text-[var(--accent)]">
                {initials || <Person fontSize="large" />}
              </div>

              <div className="min-w-0">
                <h2 className="break-words font-sora text-2xl font-bold">
                  {profile.name || "Your Name"}
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {profile.targetRole || "Target role"} ·{" "}
                  {profile.experience || "Experience level"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="max-w-full break-words rounded-full border border-[var(--border-color)] px-3 py-1 text-xs">
                    {profile.education || "Education not added"}
                  </span>

                  <span className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs">
                    {profile.location || "Location not added"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--glass-bg)] p-4 md:min-w-44 md:w-auto">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-secondary)]">
                  Profile completion
                </p>

                <AutoAwesome
                  fontSize="small"
                  className="text-[var(--accent)]"
                />
              </div>

              <h3 className="mt-2 font-sora text-2xl font-bold">
                {completion}%
              </h3>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border-color)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent)]"
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="mt-2 text-[10px] text-[var(--text-secondary)]">
                {completion === 100
                  ? "All profile details completed"
                  : "Complete your details to improve your profile"}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Personal Information */}
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
              <Person />
            </div>

            <div>
              <h2 className="font-sora text-lg font-bold">
                Personal Information
              </h2>

              <p className="text-xs text-[var(--text-secondary)]">
                Your basic contact and personal details
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField
              label="Full Name"
              field="name"
              value={profile.name}
              icon={<Person fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />

            <div>
              <ProfileField
                label="Email Address"
                field="email"
                type="email"
                value={profile.email}
                icon={<Email fontSize="small" />}
                editing={editing}
                onChange={updateField}
              />

              {editing && emailError && (
                <p className="mt-2 text-xs text-red-500">
                  {emailError}
                </p>
              )}
            </div>

            <ProfileField
              label="Phone Number"
              field="phone"
              value={profile.phone}
              icon={<Phone fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />

            <ProfileField
              label="Location"
              field="location"
              value={profile.location}
              icon={<LocationOn fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />
          </div>
        </GlassCard>

        {/* Education and Career */}
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
              <Work />
            </div>

            <div>
              <h2 className="font-sora text-lg font-bold">
                Education & Career
              </h2>

              <p className="text-xs text-[var(--text-secondary)]">
                Define your academic background and career direction
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileField
              label="Education"
              field="education"
              value={profile.education}
              icon={<School fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />

            <ProfileField
              label="University / Institution"
              field="university"
              value={profile.university}
              icon={<School fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />

            <ProfileSelect
              label="Experience Level"
              field="experience"
              value={profile.experience}
              options={[
                "Fresher",
                "Internship Experience",
                "0–2 Years",
                "2–5 Years",
                "5+ Years",
              ]}
              editing={editing}
              onChange={updateField}
            />

            <ProfileField
              label="Target Job Role"
              field="targetRole"
              value={profile.targetRole}
              icon={<Work fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />
          </div>

          <div className="mt-5">
            <ProfileField
              label="Technical Skills"
              field="skills"
              value={profile.skills}
              icon={<Code fontSize="small" />}
              editing={editing}
              onChange={updateField}
            />

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Separate skills with commas.
            </p>
          </div>

          <div className="mt-5">
            <ProfileField
              label="Career Goal"
              field="careerGoal"
              value={profile.careerGoal}
              multiline
              editing={editing}
              onChange={updateField}
            />
          </div>
        </GlassCard>

        {/* Interview Preferences */}
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
              <Psychology />
            </div>

            <div>
              <h2 className="font-sora text-lg font-bold">
                Interview Preferences
              </h2>

              <p className="text-xs text-[var(--text-secondary)]">
                Set your default mock interview configuration
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ProfileSelect
              label="Preferred Interview Type"
              field="interviewType"
              value={profile.interviewType}
              options={[
                "Technical",
                "HR",
                "Behavioral",
                "Mixed",
              ]}
              editing={editing}
              onChange={updateField}
            />

            <ProfileSelect
              label="Preferred Difficulty"
              field="difficulty"
              value={profile.difficulty}
              options={[
                "Beginner",
                "Intermediate",
                "Advanced",
              ]}
              editing={editing}
              onChange={updateField}
            />
          </div>
        </GlassCard>
      </form>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        Profile details are currently stored locally in this browser.
        Account authentication and permanent database storage will be
        added during backend integration.
      </p>
    </div>
  );
}
