
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load media");
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
