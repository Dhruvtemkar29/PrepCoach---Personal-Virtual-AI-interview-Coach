const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_ORIGIN}/api/roadmap`;

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

// 1. Fetch user roadmap tasks
export async function fetchRoadmapTasks() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch roadmap tasks.");
  }

  return data.tasks || [];
}

// 2. Toggle a task completion status
export async function toggleRoadmapTask(taskId) {
  const response = await fetch(`${API_URL}/${taskId}/toggle`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update task.");
  }

  return data;
}

// 3. Add custom task
export async function addRoadmapTask(weekNumber, title, description) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      week_number: weekNumber,
      task_title: title,
      task_description: description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add task.");
  }

  return data;
}

// 4. Reset roadmap progress
export async function resetRoadmapProgress() {
  const response = await fetch(`${API_URL}/reset`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reset roadmap.");
  }

  return data;
}

// 5. Fetch personalized AI learning recommendations
export async function fetchRoadmapRecommendations() {
  const response = await fetch(`${API_URL}/recommendations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch recommendations.");
  }

  return data.recommendations;
}
