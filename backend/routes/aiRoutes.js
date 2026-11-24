const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// Public or status check
router.get("/status", aiController.getAIStatus);

// Protected routes (require user JWT)
router.post("/questions/generate", authMiddleware, aiController.generateQuestions);
router.post("/evaluate/answer", authMiddleware, aiController.evaluateAnswer);
router.post("/evaluate/session", authMiddleware, aiController.evaluateInterviewSession);
router.post("/resume/analyze", authMiddleware, aiController.analyzeResume);
router.post("/chat", authMiddleware, aiController.chatWithCoach);

module.exports = router;
