const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_ORIGIN}/api/resumes`;

function getStoredToken() {
  return (
    localStorage.getItem("prepcoach-token") ||
    sessionStorage.getItem("prepcoach-token")
  );
}

function getAuthHeaders(isFormData = false) {
  const token = getStoredToken();
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

// 1. Fetch all resumes for the authenticated user
export async function getResumes() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch resumes.");
  }

  return data.resumes || [];
}

// 2. Upload one or multiple resumes
export async function uploadResumes(files) {
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload resume(s).");
  }

  return data;
}

// 3. Set a resume as active
export async function setActiveResume(resumeId) {
  const response = await fetch(`${API_URL}/${resumeId}/active`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update active resume.");
  }

  return data;
}

// 4. Delete a resume
export async function deleteResume(resumeId) {
  const response = await fetch(`${API_URL}/${resumeId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete resume.");
  }

  return data;
}

// 5. Download a resume file
export async function downloadResume(resumeId, fileName) {
  const response = await fetch(`${API_URL}/${resumeId}/download`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to download resume file.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName || "resume.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
