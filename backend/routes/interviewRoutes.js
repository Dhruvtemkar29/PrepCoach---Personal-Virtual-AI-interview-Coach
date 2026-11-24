const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createInterview,
  getUserInterviews,
  getInterviewById,
  saveAnswer,
  completeInterview,
  saveEvaluation,
  getEvaluation,
} = require("../controllers/interviewController");

// All interview endpoints require authentication
router.use(authMiddleware);

router.post("/", createInterview);
router.get("/", getUserInterviews);
router.get("/:id", getInterviewById);
router.post("/:id/answers", saveAnswer);
router.put("/:id/complete", completeInterview);
router.post("/:id/evaluations", saveEvaluation);
router.get("/:id/evaluations", getEvaluation);

module.exports = router;
