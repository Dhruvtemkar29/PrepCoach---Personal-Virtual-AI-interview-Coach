
import { useState } from "react";
import {
  Settings,
  Tune,
  NotificationsActive,
  Psychology,
  Security,
  Lightbulb,
  Nightlight,
  Mail,
  Campaign,
  VolumeUp,
  CalendarMonth,
  Save,
  RestartAlt,
  CheckCircle,
  Lock,
  Visibility,
  TrendingUp,
} from "@mui/icons-material";

import GlassCard from "../components/ui/GlassCard";
import { useTheme } from "../context/ThemeContext";

const STORAGE_KEY = "prepcoach-settings";

const DEFAULT_NOTIFICATIONS = {
  email: true,
  reminders: true,
  performance: true,
  announcements: false,
};

const DEFAULT_PREFERENCES = {
  interviewType: "Technical",
  difficulty: "Intermediate",
  duration: "30 minutes",
  questions: "10",
  sound: true,
  weeklyGoal: "5 hours",
};

const DEFAULT_PRIVACY = {
  saveHistory: true,
  performanceInsights: true,
};

const getInitialSettings = () => {
  const defaults = {
    notifications: DEFAULT_NOTIFICATIONS,
    preferences: DEFAULT_PREFERENCES,
    privacy: DEFAULT_PRIVACY,
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return defaults;

    const parsed = JSON.parse(stored);

    return {
      notifications: {
        ...DEFAULT_NOTIFICATIONS,
        ...parsed.notifications,
      },
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...parsed.preferences,
      },
      privacy: {
        ...DEFAULT_PRIVACY,
        ...parsed.privacy,
      },
    };
  } catch (error) {
    console.error("Unable to load PrepCoach settings:", error);
    return defaults;
  }
};

// Reusable toggle
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
        checked
          ? "bg-[var(--accent)]"
          : "bg-[var(--border-color)]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

// Reusable settings row
function SettingRow({
  title,
  description,
  checked,
  onChange,
  icon,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] py-4 last:border-0">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 text-[var(--text-secondary)]">
            {icon}
          </span>
        )}

        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>

          <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

// Reusable dropdown
function SelectSetting({ label, value, options, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[var(--text-secondary)]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  const [initialSettings] = useState(getInitialSettings);

  const [notifications, setNotifications] = useState(
    initialSettings.notifications
  );

  const [preferences, setPreferences] = useState(
    initialSettings.preferences
  );

  const [privacy, setPrivacy] = useState(
    initialSettings.privacy
  );

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Update interview preferences
  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
    setSaveError("");
  };

  // Update notification settings
  const updateNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
    setSaveError("");
  };

  // Update privacy settings
  const updatePrivacy = (key) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
    setSaveError("");
  };

  // Save all settings
  const saveSettings = () => {
    try {
      const settings = {
        notifications,
        preferences,
        privacy,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);
      setSaveError("");
    } catch (error) {
      console.error("Unable to save PrepCoach settings:", error);
      setSaved(false);
      setSaveError(
        "Unable to save settings. Please check your browser storage."
      );
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    const confirmed = window.confirm(
      "Are you sure you want to restore all settings to their default values?"
    );

    if (!confirmed) return;

    try {
      const defaults = {
        notifications: { ...DEFAULT_NOTIFICATIONS },
        preferences: { ...DEFAULT_PREFERENCES },
        privacy: { ...DEFAULT_PRIVACY },
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaults)
      );

      setNotifications(defaults.notifications);
      setPreferences(defaults.preferences);
      setPrivacy(defaults.privacy);

      setSaved(true);
      setSaveError("");
    } catch (error) {
      console.error("Unable to reset PrepCoach settings:", error);
      setSaved(false);
      setSaveError("Unable to reset settings. Please try again.");
    }
  };

  return (
    <div className="space-y-7 pb-10">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--accent)]">
            <Settings fontSize="small" />
            APPLICATION PREFERENCES
          </div>

          <h1 className="font-sora text-2xl font-bold sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Customize your PrepCoach experience and manage your preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          className="primary-button flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition"
        >
          <Save fontSize="small" />
          Save Settings
        </button>
      </div>

      {/* SAVE MESSAGE */}
      {saved && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500"
        >
          <CheckCircle fontSize="small" />
          Settings saved successfully in this browser.
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500"
        >
          {saveError}
        </div>
      )}

      {/* APPEARANCE */}
      <GlassCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
            <Tune />
          </div>

          <div>
            <h2 className="font-sora text-lg font-bold">
              Appearance
            </h2>

            <p className="text-xs text-[var(--text-secondary)]">
              Customize the look and feel of PrepCoach.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* LIGHT MODE */}
          <button
            type="button"
            aria-pressed={!isDark}
            onClick={() => {
              if (isDark) toggleTheme();
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              !isDark
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border-color)] hover:border-[var(--accent)]/50"
            }`}
          >
            <div className="mb-4 flex h-24 items-center justify-center rounded-xl border border-gray-200 bg-[#f4f3f2]">
              <div className="flex items-center gap-3 rounded-xl border border-white bg-white/90 p-4 shadow">
                <Lightbulb className="text-orange-500" />

                <div className="space-y-2">
                  <div className="h-2 w-20 rounded bg-gray-400" />
                  <div className="h-2 w-14 rounded bg-gray-200" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Light Mode</p>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Bright glass interface
                </p>
              </div>

              {!isDark && (
                <CheckCircle className="text-[var(--accent)]" />
              )}
            </div>
          </button>

          {/* DARK MODE */}
          <button
            type="button"
            aria-pressed={isDark}
            onClick={() => {
              if (!isDark) toggleTheme();
            }}
            className={`rounded-2xl border p-4 text-left transition ${
              isDark
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border-color)] hover:border-[var(--accent)]/50"
            }`}
          >
            <div className="mb-4 flex h-24 items-center justify-center rounded-xl border border-white/10 bg-[#08090e]">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-4 shadow">
                <Nightlight className="text-orange-400" />

                <div className="space-y-2">
                  <div className="h-2 w-20 rounded bg-gray-400" />
                  <div className="h-2 w-14 rounded bg-gray-600" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Dark Mode</p>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Immersive dark glass interface
                </p>
              </div>

              {isDark && (
                <CheckCircle className="text-[var(--accent)]" />
              )}
            </div>
          </button>
        </div>
      </GlassCard>

      {/* INTERVIEW PREFERENCES */}
      <GlassCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
            <Psychology className="text-[var(--accent)]" />
          </div>

          <div>
            <h2 className="font-sora text-lg font-bold">
              Interview Preferences
            </h2>

            <p className="text-xs text-[var(--text-secondary)]">
              Set your default practice session configuration.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectSetting
            label="Default Interview Type"
            value={preferences.interviewType}
            options={["Technical", "HR", "Behavioral", "Mixed"]}
            onChange={(value) =>
              updatePreference("interviewType", value)
            }
          />

          <SelectSetting
            label="Default Difficulty"
            value={preferences.difficulty}
            options={["Beginner", "Intermediate", "Advanced"]}
            onChange={(value) =>
              updatePreference("difficulty", value)
            }
          />

          <SelectSetting
            label="Session Duration"
            value={preferences.duration}
            options={[
              "15 minutes",
              "30 minutes",
              "45 minutes",
              "60 minutes",
            ]}
            onChange={(value) =>
              updatePreference("duration", value)
            }
          />

          <SelectSetting
            label="Questions Per Session"
            value={preferences.questions}
            options={["5", "10", "15", "20"]}
            onChange={(value) =>
              updatePreference("questions", value)
            }
          />

          <SelectSetting
            label="Weekly Practice Goal"
            value={preferences.weeklyGoal}
            options={[
              "2 hours",
              "3 hours",
              "5 hours",
              "7 hours",
              "10 hours",
            ]}
            onChange={(value) =>
              updatePreference("weeklyGoal", value)
            }
          />
        </div>

        <div className="mt-4">
          <SettingRow
            title="Interview Sound Effects"
            description="Enable audio feedback during practice sessions when supported."
            checked={preferences.sound}
            onChange={() =>
              updatePreference("sound", !preferences.sound)
            }
            icon={<VolumeUp fontSize="small" />}
          />
        </div>
      </GlassCard>

      {/* NOTIFICATIONS */}
      <GlassCard>
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
            <NotificationsActive className="text-[var(--accent)]" />
          </div>

          <div>
            <h2 className="font-sora text-lg font-bold">
              Notifications
            </h2>

            <p className="text-xs text-[var(--text-secondary)]">
              Choose the updates you want to receive.
            </p>
          </div>
        </div>

        <SettingRow
          title="Email Notifications"
          description="Receive important account and application updates."
          icon={<Mail fontSize="small" />}
          checked={notifications.email}
          onChange={() => updateNotification("email")}
        />

        <SettingRow
          title="Practice Reminders"
          description="Get reminders to maintain your preparation routine."
          icon={<CalendarMonth fontSize="small" />}
          checked={notifications.reminders}
          onChange={() => updateNotification("reminders")}
        />

        <SettingRow
          title="Performance Updates"
          description="Receive updates about your interview performance."
          icon={<TrendingUp fontSize="small" />}
          checked={notifications.performance}
          onChange={() => updateNotification("performance")}
        />

        <SettingRow
          title="Product Announcements"
          description="Receive information about new PrepCoach features."
          icon={<Campaign fontSize="small" />}
          checked={notifications.announcements}
          onChange={() => updateNotification("announcements")}
        />
      </GlassCard>

      {/* PRIVACY */}
      <GlassCard>
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
            <Security className="text-[var(--accent)]" />
          </div>

          <div>
            <h2 className="font-sora text-lg font-bold">
              Privacy & Data
            </h2>

            <p className="text-xs text-[var(--text-secondary)]">
              Manage how your practice information is handled.
            </p>
          </div>
        </div>

        <SettingRow
          title="Save Interview History"
          description="Keep completed interview sessions in your history."
          icon={<CalendarMonth fontSize="small" />}
          checked={privacy.saveHistory}
          onChange={() => updatePrivacy("saveHistory")}
        />

        <SettingRow
          title="Performance Insights"
          description="Allow practice results to contribute to performance insights."
          icon={<Visibility fontSize="small" />}
          checked={privacy.performanceInsights}
          onChange={() => updatePrivacy("performanceInsights")}
        />

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--border-color)] p-4">
          <Lock
            className="mt-0.5 text-[var(--accent)]"
            fontSize="small"
          />

          <div>
            <p className="text-sm font-semibold">
              Your data matters
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              These controls are currently frontend preferences.
              Actual data retention, account security, notification
              delivery, and privacy enforcement require backend
              implementation.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* RESET */}
      <GlassCard>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold">
              Reset preferences
            </h3>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Restore interview, notification, and privacy settings to defaults.
            </p>
          </div>

          <button
            type="button"
            onClick={resetSettings}
            className="secondary-button flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            <RestartAlt fontSize="small" />
            Reset Settings
          </button>
        </div>
      </GlassCard>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        PrepCoach Settings · Preferences are stored locally in your browser.
      </p>
    </div>
  );
}
