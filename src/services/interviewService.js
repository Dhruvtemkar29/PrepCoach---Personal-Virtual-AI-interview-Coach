const API_URL = "http://localhost:5000/api/interviews";

function getStoredToken() {
  return (
    localStorage.getItem("prepcoach-token") ||
    sessionStorage.getItem("prepcoach-token")
  );
}

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// 1. Start a new interview session and optionally register initial questions
export async function startInterview(config) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      interview_type: config.type,
      difficulty: config.difficulty,
      duration_minutes: config.duration,
      target_role: config.role,
      job_description: config.jobDescription,
      resume_id: config.resumeId || null,
      questions: config.questions || [],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to start interview.");
  }

  return data;
}

// 2. Fetch past interview sessions for History and Analytics
export async function getInterviewHistory() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch interview history.");
  }

  return data.interviews || [];
}

// 3. Fetch single interview with full details
export async function getInterviewDetails(interviewId) {
  const response = await fetch(`${API_URL}/${interviewId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch interview details.");
  }

  return data;
}

// 4. Save a user's answer to a specific question
export async function saveQuestionAnswer(interviewId, questionId, text, durationSeconds = 0) {
  const response = await fetch(`${API_URL}/${interviewId}/answers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      question_id: questionId,
      answer_text: text,
      answer_duration_seconds: durationSeconds,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to record answer.");
  }

  return data;
}

// 5. Complete an interview
export async function finishInterview(interviewId) {
  const response = await fetch(`${API_URL}/${interviewId}/complete`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to finalize interview.");
  }

  return data;
}

// 6. Save evaluation scores and feedback
export async function saveEvaluation(interviewId, evaluation) {
  const response = await fetch(`${API_URL}/${interviewId}/evaluations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(evaluation),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save evaluation.");
  }

  return data;
}

// 7. Get evaluation for an interview
export async function getEvaluation(interviewId) {
  const response = await fetch(`${API_URL}/${interviewId}/evaluations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch evaluation.");
  }

  return data.evaluation;
}
