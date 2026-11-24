const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { extractResumeText } = require("../services/aiService");

const BACKEND_ROOT = path.resolve(__dirname, "..");
const UPLOAD_DIR = path.resolve(BACKEND_ROOT, "uploads/resumes");

function getSafeFilePath(relativePath) {
  const filePath = path.resolve(BACKEND_ROOT, relativePath);

  if (!filePath.startsWith(`${UPLOAD_DIR}${path.sep}`)) {
    return null;
  }

  return filePath;
}

// GET ALL RESUMES
exports.getResumes = async (req, res) => {
  try {
    const [resumes] = await db.query(
      `SELECT resume_id, file_name, file_type, file_size,
              is_active, uploaded_at
       FROM resumes
       WHERE user_id = ?
       ORDER BY uploaded_at DESC`,
      [req.user.userId]
    );

    res.json({ success: true, resumes });
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch resumes.",
    });
  }
};

// UPLOAD RESUMES
exports.uploadResumes = async (req, res) => {
  const files = req.files || [];

  if (!files.length) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one resume.",
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT resume_id FROM resumes WHERE user_id = ? AND is_active = 1 FOR UPDATE",
      [req.user.userId]
    );

    let shouldActivate = existing.length === 0;
    const uploadedResumes = [];

    for (const file of files) {
      // Extract text content using AI parser
      let extractedText = null;
      try {
        extractedText = await extractResumeText(file.path, file.originalname);
      } catch (e) {
        console.warn("Could not extract resume text on upload:", e.message);
      }

      const [result] = await connection.query(
        `INSERT INTO resumes
         (user_id, file_name, file_path, file_type, file_size, extracted_text, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.userId,
          file.originalname,
          path.posix.join("uploads", "resumes", file.filename),
          path.extname(file.originalname).slice(1).toUpperCase(),
          file.size,
          extractedText,
          shouldActivate ? 1 : 0,
        ]
      );

      uploadedResumes.push({
        resume_id: result.insertId,
        file_name: file.originalname,
        file_type: path.extname(file.originalname).slice(1).toUpperCase(),
        file_size: file.size,
        is_active: shouldActivate ? 1 : 0,
      });

      shouldActivate = false;
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `${files.length} resume(s) uploaded successfully.`,
      resumes: uploadedResumes,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    await Promise.all(
      files.map((file) =>
        fs.promises.unlink(file.path).catch(() => {})
      )
    );

    console.error("Upload resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to upload resumes.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// SET ACTIVE RESUME
exports.setActiveResume = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [resume] = await connection.query(
      "SELECT resume_id FROM resumes WHERE resume_id = ? AND user_id = ? FOR UPDATE",
      [id, req.user.userId]
    );

    if (!resume.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    await connection.query(
      "UPDATE resumes SET is_active = 0 WHERE user_id = ?",
      [req.user.userId]
    );

    await connection.query(
      "UPDATE resumes SET is_active = 1 WHERE resume_id = ? AND user_id = ?",
      [id, req.user.userId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Active resume updated successfully.",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Set active resume error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update active resume.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// DELETE RESUME
exports.deleteResume = async (req, res) => {
  const { id } = req.params;
  let connection;
  let deletedResume;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT resume_id, file_path, is_active FROM resumes WHERE resume_id = ? AND user_id = ? FOR UPDATE",
      [id, req.user.userId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    deletedResume = rows[0];

    await connection.query(
      "DELETE FROM resumes WHERE resume_id = ? AND user_id = ?",
      [id, req.user.userId]
    );

    if (deletedResume.is_active) {
      const [remaining] = await connection.query(
        `SELECT resume_id FROM resumes
         WHERE user_id = ?
         ORDER BY uploaded_at DESC
         LIMIT 1`,
        [req.user.userId]
      );

      if (remaining.length) {
        await connection.query(
          "UPDATE resumes SET is_active = 1 WHERE resume_id = ? AND user_id = ?",
          [remaining[0].resume_id, req.user.userId]
        );
      }
    }

    await connection.commit();

    const filePath = getSafeFilePath(deletedResume.file_path);

    if (filePath) {
      await fs.promises.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("Unable to remove stored resume:", error);
        }
      });
    }

    res.json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete resume.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// DOWNLOAD RESUME
exports.downloadResume = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT file_name, file_path
       FROM resumes
       WHERE resume_id = ? AND user_id = ?`,
      [req.params.id, req.user.userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    const filePath = getSafeFilePath(rows[0].file_path);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file is missing from storage.",
      });
    }

    res.download(filePath, rows[0].file_name);
  } catch (error) {
    console.error("Download resume error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to download resume.",
    });
  }
};