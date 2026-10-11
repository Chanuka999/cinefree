
import { useEffect, useState } from "react";
import { fetchMedia } from "../services/api";

export default function useMedia(options = {}) {
  const { type = "all", category = "popular", search = "" } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMedia() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          type,
          category,
        });

        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/media?${params}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load titles");
        }

        setItems(data.results);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadMedia();

    return () => controller.abort();
  }, [type, category, search]);

  return { items, loading, error };
}
