const db = require("../config/db");

// 1. START A NEW INTERVIEW
exports.createInterview = async (req, res) => {
  const {
    interview_type,
    difficulty,
    duration_minutes,
    target_role,
    job_description,
    resume_id,
    questions,
  } = req.body;

  if (!interview_type || !difficulty) {
    return res.status(400).json({
      success: false,
      message: "Interview type and difficulty are required.",
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Insert interview record
    const [result] = await connection.query(
      `INSERT INTO interviews
       (user_id, resume_id, interview_type, difficulty, duration_minutes, target_role, job_description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress')`,
      [
        req.user.userId,
        resume_id || null,
        interview_type,
        difficulty,
        duration_minutes || 15,
        target_role || "Software Developer",
        job_description || null,
      ]
    );

    const interviewId = result.insertId;
    const insertedQuestions = [];

    // If initial questions are provided, insert them into interview_questions
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionText = typeof q === "string" ? q : q.question_text || q.text;
        const category = q.category || interview_type;
        const qDifficulty = q.difficulty || difficulty;

        const [qResult] = await connection.query(
          `INSERT INTO interview_questions
           (interview_id, question_text, question_number, category, difficulty)
           VALUES (?, ?, ?, ?, ?)`,
          [interviewId, questionText, i + 1, category, qDifficulty]
        );

        insertedQuestions.push({
          question_id: qResult.insertId,
          question_text: questionText,
          question_number: i + 1,
          category,
          difficulty: qDifficulty,
        });
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Interview session started successfully.",
      interview_id: interviewId,
      interview: {
        interview_id: interviewId,
        user_id: req.user.userId,
        interview_type,
        difficulty,
        duration_minutes: duration_minutes || 15,
        target_role,
        status: "in_progress",
      },
      questions: insertedQuestions,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Create interview error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create interview session.",
    });
  } finally {
    if (connection) connection.release();
  }
};

// 2. GET ALL INTERVIEWS FOR AUTHENTICATED USER
exports.getUserInterviews = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        i.interview_id,
        i.interview_type,
        i.difficulty,
        i.duration_minutes,
        i.target_role,
        i.status,
        i.started_at,
        i.completed_at,
        e.overall_score,
        e.technical_score,
        e.communication_score,
        e.confidence_score,
        (SELECT COUNT(*) FROM interview_questions q WHERE q.interview_id = i.interview_id) as total_questions,
        (SELECT COUNT(*) FROM interview_answers a
         JOIN interview_questions q2 ON a.question_id = q2.question_id
         WHERE q2.interview_id = i.interview_id) as answered_questions
       FROM interviews i
       LEFT JOIN evaluations e ON i.interview_id = e.interview_id
       WHERE i.user_id = ?
       ORDER BY i.started_at DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      interviews: rows,
    });
  } catch (error) {
    console.error("Get user interviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch interview history.",
    });
  }
};

// 3. GET SINGLE INTERVIEW WITH QUESTIONS AND ANSWERS
exports.getInterviewById = async (req, res) => {
  const { id } = req.params;

  try {
    const [interviews] = await db.query(
      `SELECT
        i.*,
        r.file_name as resume_name,
        e.overall_score,
        e.technical_score,
        e.communication_score,
        e.confidence_score,
        e.strengths,
        e.improvements,
        e.detailed_feedback,
        e.evaluated_at
       FROM interviews i
       LEFT JOIN resumes r ON i.resume_id = r.resume_id
       LEFT JOIN evaluations e ON i.interview_id = e.interview_id
       WHERE i.interview_id = ? AND i.user_id = ?
       LIMIT 1`,
      [id, req.user.userId]
    );

    if (!interviews.length) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    const interview = interviews[0];

    // Safely parse evaluation JSON fields if present
    if (interview.strengths && typeof interview.strengths === "string") {
      try {
        interview.strengths = JSON.parse(interview.strengths);
      } catch {}
    }
    if (interview.improvements && typeof interview.improvements === "string") {
      try {
        interview.improvements = JSON.parse(interview.improvements);
      } catch {}
    }

    // Fetch questions and answers for this interview
    const [questions] = await db.query(
      `SELECT
        q.question_id,
        q.question_number,
        q.question_text,
        q.category,
        q.difficulty,
        a.answer_id,
        a.answer_text,
        a.answer_duration_seconds,
        a.answered_at
       FROM interview_questions q
       LEFT JOIN interview_answers a ON q.question_id = a.question_id
       WHERE q.interview_id = ?
       ORDER BY q.question_number ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      interview,
      questions,
    });
  } catch (error) {
    console.error("Get interview by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch interview details.",
    });
  }
};

// 4. SAVE OR UPDATE QUESTION ANSWER
exports.saveAnswer = async (req, res) => {
  const { id } = req.params; // interview_id
  const { question_id, answer_text, answer_duration_seconds } = req.body;

  if (!question_id) {
    return res.status(400).json({
      success: false,
      message: "Question ID is required.",
    });
  }

  try {
    // Verify question belongs to user's interview
    const [qRows] = await db.query(
      `SELECT q.question_id
       FROM interview_questions q
       JOIN interviews i ON q.interview_id = i.interview_id
       WHERE q.question_id = ? AND i.interview_id = ? AND i.user_id = ?
       LIMIT 1`,
      [question_id, id, req.user.userId]
    );

    if (!qRows.length) {
      return res.status(404).json({
        success: false,
        message: "Question not found in this interview.",
      });
    }

    // Upsert into interview_answers
    await db.query(
      `INSERT INTO interview_answers
       (question_id, answer_text, answer_duration_seconds)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       answer_text = VALUES(answer_text),
       answer_duration_seconds = VALUES(answer_duration_seconds),
       answered_at = CURRENT_TIMESTAMP`,
      [question_id, answer_text || "", answer_duration_seconds || 0]
    );

    return res.status(200).json({
      success: true,
      message: "Answer recorded successfully.",
    });
  } catch (error) {
    console.error("Save answer error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save answer.",
    });
  }
};

// 5. MARK INTERVIEW AS COMPLETED
exports.completeInterview = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE interviews
       SET status = 'completed',
           completed_at = CURRENT_TIMESTAMP
       WHERE interview_id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview marked as completed.",
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to complete interview.",
    });
  }
};

// 6. SAVE INTERVIEW EVALUATION
exports.saveEvaluation = async (req, res) => {
  const { id } = req.params;
  const {
    overall_score,
    technical_score,
    communication_score,
    confidence_score,
    strengths,
    improvements,
    detailed_feedback,
  } = req.body;

  try {
    // Check interview belongs to user
    const [intCheck] = await db.query(
      "SELECT interview_id FROM interviews WHERE interview_id = ? AND user_id = ? LIMIT 1",
      [id, req.user.userId]
    );

    if (!intCheck.length) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    const safeStrengths =
      strengths !== undefined
        ? typeof strengths === "object"
          ? JSON.stringify(strengths)
          : strengths
        : JSON.stringify([]);

    const safeImprovements =
      improvements !== undefined
        ? typeof improvements === "object"
          ? JSON.stringify(improvements)
          : improvements
        : JSON.stringify([]);

    await db.query(
      `INSERT INTO evaluations
       (interview_id, overall_score, technical_score, communication_score,
        confidence_score, strengths, improvements, detailed_feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       overall_score = VALUES(overall_score),
       technical_score = VALUES(technical_score),
       communication_score = VALUES(communication_score),
       confidence_score = VALUES(confidence_score),
       strengths = VALUES(strengths),
       improvements = VALUES(improvements),
       detailed_feedback = VALUES(detailed_feedback),
       evaluated_at = CURRENT_TIMESTAMP`,
      [
        id,
        overall_score || 0,
        technical_score || 0,
        communication_score || 0,
        confidence_score || 0,
        safeStrengths,
        safeImprovements,
        detailed_feedback || "",
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Evaluation saved successfully.",
    });
  } catch (error) {
    console.error("Save evaluation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save evaluation.",
    });
  }
};

// 7. GET INTERVIEW EVALUATION
exports.getEvaluation = async (req, res) => {
  const { id } = req.params;

  try {
    const [evaluations] = await db.query(
      `SELECT e.*
       FROM evaluations e
       JOIN interviews i ON e.interview_id = i.interview_id
       WHERE e.interview_id = ? AND i.user_id = ?
       LIMIT 1`,
      [id, req.user.userId]
    );

    if (!evaluations.length) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found for this interview.",
      });
    }

    const evaluation = evaluations[0];
    if (typeof evaluation.strengths === "string") {
      try {
        evaluation.strengths = JSON.parse(evaluation.strengths);
      } catch {}
    }
    if (typeof evaluation.improvements === "string") {
      try {
        evaluation.improvements = JSON.parse(evaluation.improvements);
      } catch {}
    }

    return res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Get evaluation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch evaluation.",
    });
  }
};
