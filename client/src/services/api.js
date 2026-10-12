
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`);
  } catch {
    throw new Error(`API is unreachable at ${API_URL}. Check VITE_API_URL and the backend deployment.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : {};

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || `API returned ${response.status} ${response.statusText || "error"}`
    );
  }

  return data;
}

export function fetchMedia({
  type = "all",
  category = "popular",
  search = "",
  page = 1,
} = {}) {
  const params = new URLSearchParams({
    type,
    category,
    page: String(page),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return request(`/media?${params.toString()}`);
}

export function fetchMediaDetails(type, id) {
  return request(`/media/${type}/${id}`);
}


export async function saveMediaSource(payload) {
  const token = localStorage.getItem("cinefree-token");
  const response = await fetch(`${API_URL}/media/admin/source`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Unable to save movie source.");
  }
  return data;
}

export async function fetchAdminMediaList() {
  const token = localStorage.getItem("cinefree-token");
  const response = await fetch(`${API_URL}/media/admin/list`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load media list.");
  }
  return data;
}

export async function deleteAdminMediaSource(id) {
  const token = localStorage.getItem("cinefree-token");
  const response = await fetch(`${API_URL}/media/admin/source/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to delete media record.");
  }
  return data;
}

export async function fetchAdminUsers() {
  const token = localStorage.getItem("cinefree-token");
  const response = await fetch(`${API_URL}/auth/admin/users`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load registered users.");
  }
  return data;
}

export async function updateAdminUserRole(userId, role) {
  const token = localStorage.getItem("cinefree-token");
  const response = await fetch(`${API_URL}/auth/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ role }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to update user role.");
  }
  return data;
}
