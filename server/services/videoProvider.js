
const baseUrl = process.env.VIDEO_PROVIDER_BASE_URL;
const apiKey = process.env.VIDEO_PROVIDER_API_KEY;

export async function getPlayback(movieId) {
  if (!baseUrl || !apiKey) {
    throw new Error("Video provider is not configured");
  }

  const response = await fetch(
    `${baseUrl}/v1/movies/${encodeURIComponent(movieId)}/playback`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(`Provider playback error: ${response.status}`);
  }

  const data = await response.json();

  // Adapt these fields to the real provider's response.
  if (
    typeof data.playbackUrl !== "string" ||
    !["https:", "http:"].includes(new URL(data.playbackUrl).protocol)
  ) {
    throw new Error("Provider returned an invalid playback URL");
  }

  return {
    playbackUrl: data.playbackUrl,
    format: data.format ?? "unknown",
    expiresAt: data.expiresAt ?? null,
  };
}

export async function getDownload(movieId) {
  if (!baseUrl || !apiKey) {
    throw new Error("Video provider is not configured");
  }

  const response = await fetch(
    `${baseUrl}/v1/movies/${encodeURIComponent(movieId)}/download`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(`Provider download error: ${response.status}`);
  }

  const data = await response.json();

  // Only return a download link if the provider explicitly
  // authorizes downloading this title for the current user.
  if (
    data.downloadAllowed !== true ||
    typeof data.downloadUrl !== "string" ||
    !["https:", "http:"].includes(new URL(data.downloadUrl).protocol)
  ) {
    throw new Error("Download is not available for this movie");
  }

  return {
    downloadUrl: data.downloadUrl,
    expiresAt: data.expiresAt ?? null,
  };
}
