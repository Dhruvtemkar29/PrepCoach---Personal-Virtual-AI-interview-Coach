const db = require("../config/db");

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        preferred_interview_type,
        preferred_difficulty,
        preferred_duration,
        questions_per_interview,
        weekly_goal,
        theme
       FROM user_settings
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "User settings not found.",
      });
    }

    return res.status(200).json({
      success: true,
      settings: rows[0],
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch settings.",
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      preferred_interview_type,
      preferred_difficulty,
    } = req.body;

    const allowedTypes = ["Technical", "HR", "Behavioral", "Mixed"];
    const allowedDifficulties = ["Beginner", "Intermediate", "Advanced"];

    if (
      !allowedTypes.includes(preferred_interview_type) ||
      !allowedDifficulties.includes(preferred_difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type or difficulty.",
      });
    }

    const [result] = await db.execute(
      `UPDATE user_settings
       SET preferred_interview_type = ?,
           preferred_difficulty = ?
       WHERE user_id = ?`,
      [
        preferred_interview_type,
        preferred_difficulty,
        req.user.userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User settings not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview preferences updated successfully.",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update interview preferences.",
    });
  }
};