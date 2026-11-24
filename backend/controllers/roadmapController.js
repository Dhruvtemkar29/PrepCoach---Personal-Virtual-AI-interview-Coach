const db = require("../config/db");

const DEFAULT_ROADMAP_TASKS = [
  // Week 1: Foundation
  { week: 1, title: "Identify target job roles", desc: "Choose 2–3 career roles to prepare for." },
  { week: 1, title: "Review core programming concepts", desc: "Revise variables, loops, functions and OOP." },
  { week: 1, title: "Prepare your self introduction", desc: "Create a concise 60–90 second introduction." },
  { week: 1, title: "Complete a baseline mock interview", desc: "Evaluate your starting performance." },
  // Week 2: Technical
  { week: 2, title: "Practice data structures and algorithms", desc: "Solve arrays, strings, stacks and linked lists." },
  { week: 2, title: "Revise database fundamentals", desc: "Practice SQL, joins and normalization." },
  { week: 2, title: "Review your technical projects", desc: "Prepare architecture and implementation explanations." },
  { week: 2, title: "Attempt a technical mock interview", desc: "Practice explaining your solutions." },
  // Week 3: Communication
  { week: 3, title: "Practice common HR questions", desc: "Prepare strengths, weaknesses and career goals." },
  { week: 3, title: "Learn the STAR response method", desc: "Structure behavioral answers clearly." },
  { week: 3, title: "Practice speaking with clarity", desc: "Focus on pace, structure and concise answers." },
  { week: 3, title: "Complete a behavioral mock interview", desc: "Review your responses and confidence." },
  // Week 4: Readiness
  { week: 4, title: "Complete a full mock interview", desc: "Attempt a complete interview simulation." },
  { week: 4, title: "Review your performance analytics", desc: "Identify your strongest and weakest areas." },
  { week: 4, title: "Revise your resume and projects", desc: "Ensure your resume matches your target role." },
  { week: 4, title: "Create your final improvement checklist", desc: "Set goals for continued preparation." },
];

// 1. GET ROADMAP TASKS (Auto-seed if user has none)
exports.getRoadmap = async (req, res) => {
  try {
    const [existing] = await db.query(
      `SELECT task_id, week_number, task_title, task_description, is_completed, completed_at
       FROM roadmap_tasks
       WHERE user_id = ?
       ORDER BY week_number ASC, task_id ASC`,
      [req.user.userId]
    );

    if (existing.length === 0) {
      // Seed initial tasks
      for (const t of DEFAULT_ROADMAP_TASKS) {
        await db.query(
          `INSERT INTO roadmap_tasks (user_id, week_number, task_title, task_description, is_completed)
           VALUES (?, ?, ?, ?, 0)`,
          [req.user.userId, t.week, t.title, t.desc]
        );
      }

      const [seeded] = await db.query(
        `SELECT task_id, week_number, task_title, task_description, is_completed, completed_at
         FROM roadmap_tasks
         WHERE user_id = ?
         ORDER BY week_number ASC, task_id ASC`,
        [req.user.userId]
      );

      return res.status(200).json({
        success: true,
        tasks: seeded,
      });
    }

    return res.status(200).json({
      success: true,
      tasks: existing,
    });
  } catch (error) {
    console.error("Get roadmap error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch learning roadmap.",
    });
  }
};

// 2. TOGGLE TASK COMPLETION STATUS
exports.toggleTask = async (req, res) => {
  const { id } = req.params;

  try {
    const [task] = await db.query(
      "SELECT task_id, is_completed FROM roadmap_tasks WHERE task_id = ? AND user_id = ? LIMIT 1",
      [id, req.user.userId]
    );

    if (!task.length) {
      return res.status(404).json({
        success: false,
        message: "Roadmap task not found.",
      });
    }

    const currentStatus = task[0].is_completed;
    const nextStatus = currentStatus ? 0 : 1;

    await db.query(
      `UPDATE roadmap_tasks
       SET is_completed = ?,
           completed_at = IF(? = 1, CURRENT_TIMESTAMP, NULL)
       WHERE task_id = ? AND user_id = ?`,
      [nextStatus, nextStatus, id, req.user.userId]
    );

    return res.status(200).json({
      success: true,
      message: "Task progress updated.",
      is_completed: Boolean(nextStatus),
    });
  } catch (error) {
    console.error("Toggle roadmap task error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update task progress.",
    });
  }
};

// 3. ADD CUSTOM TASK
exports.addTask = async (req, res) => {
  const { week_number, task_title, task_description } = req.body;

  if (!week_number || !task_title) {
    return res.status(400).json({
      success: false,
      message: "Week number and task title are required.",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO roadmap_tasks (user_id, week_number, task_title, task_description, is_completed)
       VALUES (?, ?, ?, ?, 0)`,
      [req.user.userId, week_number, task_title, task_description || ""]
    );

    return res.status(201).json({
      success: true,
      message: "Task added to roadmap.",
      task_id: result.insertId,
    });
  } catch (error) {
    console.error("Add roadmap task error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add task to roadmap.",
    });
  }
};

// 4. RESET ROADMAP PROGRESS
exports.resetRoadmap = async (req, res) => {
  try {
    await db.query(
      `UPDATE roadmap_tasks
       SET is_completed = 0,
           completed_at = NULL
       WHERE user_id = ?`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      message: "Roadmap progress reset successfully.",
    });
  } catch (error) {
    console.error("Reset roadmap error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset roadmap.",
    });
  }
};
