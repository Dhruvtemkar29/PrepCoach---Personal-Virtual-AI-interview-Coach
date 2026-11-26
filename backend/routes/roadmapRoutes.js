const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getRoadmap,
  toggleTask,
  addTask,
  resetRoadmap,
  getRecommendations,
} = require("../controllers/roadmapController");

router.use(authMiddleware);

router.get("/", getRoadmap);
router.get("/recommendations", getRecommendations);
router.put("/:id/toggle", toggleTask);
router.post("/tasks", addTask);
router.post("/reset", resetRoadmap);

module.exports = router;
