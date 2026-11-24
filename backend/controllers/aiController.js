const aiService = require("../services/aiService");
const db = require("../config/db");

// 1. GET AI SERVICE STATUS
exports.getAIStatus = async (req, res) => {
  try {
    const status = await aiService.checkAIHealth();
    res.json({
      success: true,
      ai_service: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error querying AI service status",
      error: error.message,
    });
  }
};

// 2. GENERATE INTERVIEW QUESTIONS
exports.generateQuestions = async (req, res) => {
  try {
    const {
      role,
      interview_type,
      difficulty,
      num_questions,
      skills,
      resume_id,
      job_description,
    } = req.body;

    let resume_text = null;
    // If a resume_id is provided, look up its extracted_text from MySQL
    if (resume_id) {
      const [rows] = await db.query(
        "SELECT extracted_text FROM resumes WHERE resume_id = ? AND user_id = ?",
        [resume_id, req.user.userId]
      );
      if (rows.length > 0 && rows[0].extracted_text) {
        resume_text = rows[0].extracted_text;
      }
    }

    const aiResponse = await aiService.generateQuestions({
      role: role || "Full Stack Developer",
      interview_type: interview_type || "technical",
      difficulty: difficulty || "medium",
      num_questions: num_questions || 5,
      skills: skills || [],
      resume_text,
      job_description,
    });

    res.json({
      success: true,
      ...aiResponse,
    });
  } catch (error) {
    console.error("AI question generation error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI question generation unavailable. Ensure AI microservice is running.",
      error: error.message,
    });
  }
};

// 3. EVALUATE SINGLE ANSWER
exports.evaluateAnswer = async (req, res) => {
  try {
    const {
      question_text,
      answer_text,
      role,
      difficulty,
      category,
      duration_seconds,
    } = req.body;

    if (!question_text || !answer_text) {
      return res.status(400).json({
        success: false,
        message: "question_text and answer_text are required.",
      });
    }

    const evaluation = await aiService.evaluateAnswer({
      question_text,
      answer_text,
      role: role || "Software Engineer",
      difficulty: difficulty || "medium",
      category: category || "technical",
      duration_seconds: duration_seconds || 0,
    });

    res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("AI answer evaluation error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI answer evaluation unavailable.",
      error: error.message,
    });
  }
};

// 4. EVALUATE COMPLETED INTERVIEW SESSION
exports.evaluateInterviewSession = async (req, res) => {
  try {
    const { interview_id } = req.body;

    if (!interview_id) {
      return res.status(400).json({
        success: false,
        message: "interview_id is required.",
      });
    }

    // Verify interview belongs to user and fetch details
    const [interviewRows] = await db.query(
      "SELECT * FROM interviews WHERE interview_id = ? AND user_id = ?",
      [interview_id, req.user.userId]
    );

    if (interviewRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    const interview = interviewRows[0];

    // Fetch all questions and recorded answers
    const [qaRows] = await db.query(
      `SELECT q.question_text, q.category, a.answer_text
       FROM interview_questions q
       LEFT JOIN interview_answers a ON q.question_id = a.question_id
       WHERE q.interview_id = ?
       ORDER BY q.question_number ASC`,
      [interview_id]
    );

    const qa_pairs = qaRows.map((r) => ({
      question_text: r.question_text,
      answer_text: r.answer_text || "(No answer recorded)",
      category: r.category || interview.interview_type,
    }));

    // Call Python AI Service
    const aiEval = await aiService.evaluateSession({
      role: interview.target_role || "Software Engineer",
      difficulty: interview.difficulty || "medium",
      interview_type: interview.interview_type || "technical",
      qa_pairs,
    });

    // Save or update in evaluations table
    const [existing] = await db.query(
      "SELECT evaluation_id FROM evaluations WHERE interview_id = ?",
      [interview_id]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE evaluations
         SET overall_score = ?, technical_score = ?, communication_score = ?, confidence_score = ?,
             strengths = ?, improvements = ?, detailed_feedback = ?, evaluated_at = NOW()
         WHERE interview_id = ?`,
        [
          aiEval.overall_score,
          aiEval.technical_score,
          aiEval.communication_score,
          aiEval.confidence_score,
          JSON.stringify(aiEval.strengths),
          JSON.stringify(aiEval.improvements),
          aiEval.detailed_feedback,
          interview_id,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO evaluations
         (interview_id, overall_score, technical_score, communication_score, confidence_score, strengths, improvements, detailed_feedback)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          interview_id,
          aiEval.overall_score,
          aiEval.technical_score,
          aiEval.communication_score,
          aiEval.confidence_score,
          JSON.stringify(aiEval.strengths),
          JSON.stringify(aiEval.improvements),
          aiEval.detailed_feedback,
        ]
      );
    }

    // Mark interview as completed if not already
    await db.query(
      "UPDATE interviews SET status = 'completed', completed_at = NOW() WHERE interview_id = ?",
      [interview_id]
    );

    res.json({
      success: true,
      message: "AI session evaluation generated and saved successfully.",
      evaluation: aiEval,
    });
  } catch (error) {
    console.error("AI session evaluation error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI session evaluation failed.",
      error: error.message,
    });
  }
};

// 5. ANALYZE RESUME
exports.analyzeResume = async (req, res) => {
  try {
    const { resume_id, resume_text, target_role } = req.body;

    let textToAnalyze = resume_text;

    if (resume_id) {
      const [rows] = await db.query(
        "SELECT extracted_text FROM resumes WHERE resume_id = ? AND user_id = ?",
        [resume_id, req.user.userId]
      );
      if (rows.length > 0 && rows[0].extracted_text) {
        textToAnalyze = rows[0].extracted_text;
      }
    }

    if (!textToAnalyze) {
      return res.status(400).json({
        success: false,
        message: "No resume text found to analyze.",
      });
    }

    const analysis = await aiService.analyzeResume({
      resume_text: textToAnalyze,
      target_role: target_role || "Software Engineer",
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("AI resume analysis error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI resume analysis failed.",
      error: error.message,
    });
  }
};

// 6. CHAT WITH PREPCOACH AI
exports.chatWithCoach = async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const reply = await aiService.chatWithCoach({
      message,
      context,
      history,
    });

    res.json({
      success: true,
      ...reply,
    });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI coach is temporarily unavailable.",
      error: error.message,
    });
  }
};
