const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getRoadmap,
  toggleTask,
  addTask,
  resetRoadmap,
} = require("../controllers/roadmapController");

router.use(authMiddleware);

router.get("/", getRoadmap);
router.put("/:id/toggle", toggleTask);
router.post("/tasks", addTask);
router.post("/reset", resetRoadmap);

module.exports = router;
