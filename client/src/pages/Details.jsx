
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark, Play, Star } from "lucide-react";
import { fetchMediaDetails } from "../services/api";

export default function Details({ watchlist, onToggleSave }) {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const match = slug.match(/^(movie|series)-(\d+)$/);

        if (!match) throw new Error("Invalid title URL");

        const [, type, id] = match;
        const data = await fetchMediaDetails(type, id);

        setItem(data.result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load title");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    // fetchMediaDetails needs the abort signal passed to fetch to cancel
    // network requests. This component still guards state updates on unmount.
    loadDetails();

    return () => controller.abort();
  }, [slug]);

  if (loading) return <p className="p-16 text-center text-slate-400">Loading details...</p>;
  if (error || !item) return <p className="p-16 text-center text-rose-400">{error || "Title not found"}</p>;

  const saved = watchlist.includes(item.id);

  return (
    <section className="min-h-screen">
      <div className="relative min-h-[460px] overflow-hidden">
        {item.backdrop && (
          <img src={item.backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/70 to-transparent" />

        <div className="relative mx-auto flex max-w-[1400px] flex-col items-start gap-8 px-5 py-16 sm:flex-row sm:items-end md:px-10">
          {item.poster && <img src={item.poster} alt={item.title} className="w-44 rounded-2xl shadow-2xl sm:w-56" />}

          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-400">
              {item.type} · {item.year || "Year unavailable"}
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">{item.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-1 text-amber-400">
                <Star size={16} fill="currentColor" /> {item.rating}
              </span>
              {(item.genres || []).map((genre) => (
                <span key={genre} className="rounded-full border border-white/10 px-3 py-1">{genre}</span>
              ))}
            </div>

            <p className="mt-5 leading-7 text-slate-300">{item.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/watch/${item.id}`} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold">
                <Play size={18} /> Watch
              </Link>
              <button onClick={() => onToggleSave(item.id)} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3">
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Add to Watchlist"}
              </button>
            </div>

            {item.trailer && (
              <a
                className="mt-4 inline-block text-sm text-violet-300 hover:text-white"
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(item.trailer)}`}
                target="_blank"
                rel="noreferrer"
              >
                Watch official trailer
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10">
        <h2 className="text-xl font-bold">Cast</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
          {(item.cast || []).map((person) => (
            <div key={`${person.name}-${person.character}`} className="w-28 shrink-0">
              {person.profile ? (
                <img src={person.profile} alt={person.name} className="aspect-[3/4] w-full rounded-xl object-cover" />
              ) : (
                <div className="aspect-[3/4] rounded-xl bg-white/5" />
              )}
              <p className="mt-2 text-sm font-semibold">{person.name}</p>
              <p className="text-xs text-slate-400">{person.character}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs leading-6 text-slate-400">
          Metadata and images are provided by TMDB. This page does not imply that a movie is available for free streaming or download.
        </p>
      </div>
    </section>
  );
}
