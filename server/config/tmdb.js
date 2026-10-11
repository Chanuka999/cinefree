import "dotenv/config";

// 'themoviedb.org' kiyana thana 'b' eka add karanna
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function tmdbRequest(endpoint, params = {}) {
  const token = process.env.TMDB_BEARER_TOKEN;

  if (!token) {
    throw new Error("TMDB_BEARER_TOKEN is missing in server/.env");
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error(`TMDB request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export function imageUrl(path, size = "w500") {
  return path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : null;
}