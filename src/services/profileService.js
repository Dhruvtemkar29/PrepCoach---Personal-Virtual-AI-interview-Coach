const API_BASE_URL = "http://localhost:5000/api/profile";

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
 * Fetch authenticated user profile from MySQL backend
 */
export async function fetchUserProfile() {
  const res = await fetch(API_BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch profile (${res.status})`);
  }

  const data = await res.json();
  return data.profile;
}

/**
 * Update authenticated user profile in MySQL backend
 */
export async function saveUserProfile(profileData) {
  const res = await fetch(API_BASE_URL, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update profile (${res.status})`);
  }

  return await res.json();
}
