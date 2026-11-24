const fs = require("fs");
const path = require("path");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Extract raw text from an uploaded resume file (PDF, DOCX, or TXT)
 */
async function extractResumeText(absoluteFilePath, originalFilename) {
  try {
    const ext = path.extname(originalFilename || absoluteFilePath).toLowerCase();

    // Plain text files can be read directly
    if (ext === ".txt") {
      return fs.readFileSync(absoluteFilePath, "utf8");
    }

    // PDF and DOCX files are forwarded to Python AI service
    if (fs.existsSync(absoluteFilePath)) {
      const fileBuffer = fs.readFileSync(absoluteFilePath);
      const blob = new Blob([fileBuffer]);
      const formData = new FormData();
      formData.append("file", blob, path.basename(originalFilename || absoluteFilePath));

      const res = await fetch(`${AI_SERVICE_URL}/api/ai/resume/extract-text`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        return data.extracted_text || "";
      }
    }
    return "";
  } catch (err) {
    console.warn("Resume text extraction warning:", err.message);
    return "";
  }
}

/**
 * Check if the Python AI microservice is online and healthy
 */
async function checkAIHealth() {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { online: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

/**
 * Generate interview questions via Python AI service
 */
async function generateQuestions({
  role = "Full Stack Developer",
  interview_type = "technical",
  difficulty = "medium",
  num_questions = 5,
  skills = [],
  resume_text = null,
  job_description = null,
}) {
  const res = await fetch(`${AI_SERVICE_URL}/api/ai/questions/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      interview_type,
      difficulty,
      num_questions,
      skills,
      resume_text,
      job_description,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`AI service question generation failed with HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Evaluate a single answer via Python AI service
 */
async function evaluateAnswer({
  question_text,
  answer_text,
  role = "Software Engineer",
  difficulty = "medium",
  category = "technical",
  duration_seconds = 0,
}) {
  const res = await fetch(`${AI_SERVICE_URL}/api/ai/evaluate/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_text,
      answer_text,
      role,
      difficulty,
      category,
      duration_seconds,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`AI service answer evaluation failed with HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Evaluate an entire interview session transcript via Python AI service
 */
async function evaluateSession({
  role = "Software Engineer",
  difficulty = "medium",
  interview_type = "technical",
  qa_pairs = [],
}) {
  const res = await fetch(`${AI_SERVICE_URL}/api/ai/evaluate/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      difficulty,
      interview_type,
      qa_pairs,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`AI service session evaluation failed with HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Analyze resume text via Python AI service
 */
async function analyzeResume({ resume_text, target_role = "Software Engineer" }) {
  const res = await fetch(`${AI_SERVICE_URL}/api/ai/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text,
      target_role,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`AI service resume analysis failed with HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * PrepBot chat interaction via Python AI service
 */
async function chatWithCoach({ message, context = null, history = [] }) {
  const res = await fetch(`${AI_SERVICE_URL}/api/ai/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      context,
      history,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`AI service chat failed with HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Get personalized learning recommendations via Python AI service
 */
async function getRecommendations(params) {
  const res = await fetch(`${AI_SERVICE_URL}/api/ai/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`AI recommendations failed with HTTP ${res.status}`);
  }

  return await res.json();
}

module.exports = {
  checkAIHealth,
  extractResumeText,
  generateQuestions,
  evaluateAnswer,
  evaluateSession,
  analyzeResume,
  chatWithCoach,
  getRecommendations,
};
