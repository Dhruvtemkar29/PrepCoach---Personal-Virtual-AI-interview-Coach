const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getResumes,
  uploadResumes,
  setActiveResume,
  deleteResume,
  downloadResume,
} = require("../controllers/resumeController");

const uploadDirectory = path.resolve(__dirname, "../uploads/resumes");

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = {
  ".pdf": ["application/pdf"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ],
  ".txt": ["text/plain", "text/plain;charset=utf-8"],
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },

  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const validMimes = allowedTypes[extension];

    if (!validMimes || !validMimes.includes(file.mimetype)) {
      return callback(
        new Error("Only PDF, DOCX and TXT files are supported.")
      );
    }

    callback(null, true);
  },
});

const handleResumeUpload = (req, res, next) => {
  upload.array("files", 10)(req, res, (error) => {
    if (!error) return next();

    const message =
      error instanceof multer.MulterError
        ? error.code === "LIMIT_FILE_SIZE"
          ? "Each resume must be 5 MB or smaller."
          : error.code === "LIMIT_FILE_COUNT"
            ? "You can upload a maximum of 10 files at once."
            : error.message
        : error.message;

    return res.status(400).json({
      success: false,
      message,
    });
  });
};

// All resume endpoints require authentication
router.use(authMiddleware);

router.get("/", getResumes);
router.post("/upload", handleResumeUpload, uploadResumes);
router.put("/:id/active", setActiveResume);
router.delete("/:id", deleteResume);
router.get("/:id/download", downloadResume);

module.exports = router;