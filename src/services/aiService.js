const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_ORIGIN}/api/ai`;

function getAuthHeaders() {
  const token =
    localStorage.getItem("prepcoach-token") ||
    sessionStorage.getItem("prepcoach-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Check if the Python AI service is reachable through the Node backend
 */
export async function fetchAIStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/status`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Request AI to generate customized interview questions
 */
export async function generateAIQuestions({
  role = "Full Stack Developer",
  interview_type = "technical",
  difficulty = "medium",
  num_questions = 5,
  skills = [],
  resume_id = null,
  job_description = null,
}) {
  const res = await fetch(`${API_BASE_URL}/questions/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      role,
      interview_type,
      difficulty,
      num_questions,
      skills,
      resume_id,
      job_description,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to generate questions (${res.status})`);
  }

  return await res.json();
}

/**
 * Evaluate a single interview answer
 */
export async function evaluateAIAnswer({
  question_text,
  answer_text,
  role = "Software Engineer",
  difficulty = "medium",
  category = "technical",
  duration_seconds = 0,
}) {
  const res = await fetch(`${API_BASE_URL}/evaluate/answer`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      question_text,
      answer_text,
      role,
      difficulty,
      category,
      duration_seconds,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to evaluate answer (${res.status})`);
  }

  return await res.json();
}

/**
 * Evaluate a full completed interview session and store evaluation in MySQL
 */
export async function evaluateAISession(interviewId) {
  const res = await fetch(`${API_BASE_URL}/evaluate/session`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ interview_id: interviewId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to evaluate session (${res.status})`);
  }

  return await res.json();
}

/**
 * Analyze resume text or an uploaded resume
 */
export async function analyzeAIResume({ resume_id = null, resume_text = null, target_role = "Software Engineer" }) {
  const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ resume_id, resume_text, target_role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to analyze resume (${res.status})`);
  }

  return await res.json();
}

/**
 * Send a message to PrepBot AI coach
 */
export async function sendChatMessage({ message, context = null, history = [] }) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, context, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Chat request failed (${res.status})`);
  }

  return await res.json();
}
