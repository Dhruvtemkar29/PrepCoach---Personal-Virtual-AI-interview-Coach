const db = require("../config/db");

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        u.user_id,
        u.full_name,
        u.email,
        p.phone,
        p.location,
        p.education,
        p.university,
        p.experience_level,
        p.target_role,
        p.skills,
        p.career_goal
      FROM users u
      LEFT JOIN user_profiles p ON u.user_id = p.user_id
      WHERE u.user_id = ?
      LIMIT 1`,
      [req.user.userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const profile = rows[0];

    // Convert JSON skills into an array
    if (typeof profile.skills === "string") {
      try {
        profile.skills = JSON.parse(profile.skills);
      } catch {
        profile.skills = [];
      }
    }

    return res.status(200).json({
      success: true,
      profile: {
        ...profile,
        skills: profile.skills || [],
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      full_name,
      phone,
      location,
      education,
      university,
      experience_level,
      target_role,
      skills,
      career_goal,
    } = req.body;

    if (!full_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array.",
      });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE users
       SET full_name = ?
       WHERE user_id = ?`,
      [full_name.trim(), req.user.userId]
    );

    await connection.execute(
      `UPDATE user_profiles
       SET
        phone = ?,
        location = ?,
        education = ?,
        university = ?,
        experience_level = ?,
        target_role = ?,
        skills = ?,
        career_goal = ?
       WHERE user_id = ?`,
      [
        phone || null,
        location || null,
        education || null,
        university || null,
        experience_level || null,
        target_role || null,
        JSON.stringify(skills || []),
        career_goal || null,
        req.user.userId,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  } finally {
    connection.release();
  }
};