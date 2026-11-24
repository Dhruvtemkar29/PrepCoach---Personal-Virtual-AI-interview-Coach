const API_URL = "http://localhost:5000/api/settings";

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

export async function fetchUserSettings() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch settings.");
  }

  return data.settings;
}

export async function saveUserSettings(settingsPayload) {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update settings.");
  }

  return data;
}
