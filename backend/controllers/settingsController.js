const db = require("../config/db");

const DEFAULT_SETTINGS = {
  preferred_interview_type: "Technical",
  preferred_difficulty: "Intermediate",
  preferred_duration: 15,
  questions_per_interview: 5,
  weekly_goal: 3,
  theme: "dark",
  notifications: {
    email: true,
    reminders: true,
    performance: true,
    announcements: false,
  },
  privacy_settings: {
    saveHistory: true,
    performanceInsights: true,
  },
};

// GET USER SETTINGS
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        preferred_interview_type,
        preferred_difficulty,
        preferred_duration,
        questions_per_interview,
        weekly_goal,
        theme,
        notifications,
        privacy_settings
       FROM user_settings
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.userId]
    );

    if (!rows.length) {
      // Auto-initialize default settings for the user
      await db.query(
        `INSERT INTO user_settings
         (user_id, preferred_interview_type, preferred_difficulty,
          preferred_duration, questions_per_interview, weekly_goal,
          theme, notifications, privacy_settings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.userId,
          DEFAULT_SETTINGS.preferred_interview_type,
          DEFAULT_SETTINGS.preferred_difficulty,
          DEFAULT_SETTINGS.preferred_duration,
          DEFAULT_SETTINGS.questions_per_interview,
          DEFAULT_SETTINGS.weekly_goal,
          DEFAULT_SETTINGS.theme,
          JSON.stringify(DEFAULT_SETTINGS.notifications),
          JSON.stringify(DEFAULT_SETTINGS.privacy_settings),
        ]
      );

      return res.status(200).json({
        success: true,
        settings: DEFAULT_SETTINGS,
      });
    }

    const settings = rows[0];

    // Safely parse JSON columns if they come as string
    if (typeof settings.notifications === "string") {
      try {
        settings.notifications = JSON.parse(settings.notifications);
      } catch {
        settings.notifications = DEFAULT_SETTINGS.notifications;
      }
    }

    if (typeof settings.privacy_settings === "string") {
      try {
        settings.privacy_settings = JSON.parse(settings.privacy_settings);
      } catch {
        settings.privacy_settings = DEFAULT_SETTINGS.privacy_settings;
      }
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user settings.",
    });
  }
};

// UPDATE USER SETTINGS
exports.updateSettings = async (req, res) => {
  try {
    const {
      preferred_interview_type,
      preferred_difficulty,
      preferred_duration,
      questions_per_interview,
      weekly_goal,
      theme,
      notifications,
      privacy_settings,
    } = req.body;

    const [existing] = await db.query(
      "SELECT setting_id FROM user_settings WHERE user_id = ? LIMIT 1",
      [req.user.userId]
    );

    const safeNotifications =
      notifications !== undefined
        ? typeof notifications === "object"
          ? JSON.stringify(notifications)
          : notifications
        : JSON.stringify(DEFAULT_SETTINGS.notifications);

    const safePrivacy =
      privacy_settings !== undefined
        ? typeof privacy_settings === "object"
          ? JSON.stringify(privacy_settings)
          : privacy_settings
        : JSON.stringify(DEFAULT_SETTINGS.privacy_settings);

    const safeTheme = theme === "light" ? "light" : "dark";

    if (!existing.length) {
      await db.query(
        `INSERT INTO user_settings
         (user_id, preferred_interview_type, preferred_difficulty,
          preferred_duration, questions_per_interview, weekly_goal,
          theme, notifications, privacy_settings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.userId,
          preferred_interview_type || DEFAULT_SETTINGS.preferred_interview_type,
          preferred_difficulty || DEFAULT_SETTINGS.preferred_difficulty,
          preferred_duration || DEFAULT_SETTINGS.preferred_duration,
          questions_per_interview || DEFAULT_SETTINGS.questions_per_interview,
          weekly_goal || DEFAULT_SETTINGS.weekly_goal,
          safeTheme,
          safeNotifications,
          safePrivacy,
        ]
      );
    } else {
      await db.query(
        `UPDATE user_settings
         SET preferred_interview_type = COALESCE(?, preferred_interview_type),
             preferred_difficulty = COALESCE(?, preferred_difficulty),
             preferred_duration = COALESCE(?, preferred_duration),
             questions_per_interview = COALESCE(?, questions_per_interview),
             weekly_goal = COALESCE(?, weekly_goal),
             theme = COALESCE(?, theme),
             notifications = COALESCE(?, notifications),
             privacy_settings = COALESCE(?, privacy_settings)
         WHERE user_id = ?`,
        [
          preferred_interview_type,
          preferred_difficulty,
          preferred_duration,
          questions_per_interview,
          weekly_goal,
          safeTheme,
          safeNotifications,
          safePrivacy,
          req.user.userId,
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update user settings.",
    });
  }
};
