import { Link } from "react-router-dom";
import { Bookmark, Star } from "lucide-react";

export default function MovieCard({ item, saved = false, onToggleSave }) {
  return (
    <article className="group min-w-0">
      <Link
        to={`/title/${item.slug}`}
        className="relative block aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      >
        <img
          src={item.poster}
          alt={item.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        <span className="absolute left-3 top-3 rounded-md bg-black/65 px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-200">
          {item.type}
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 text-sm font-bold text-amber-400">
          <Star size={14} fill="currentColor" /> {item.rating}
        </span>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/title/${item.slug}`}
            className="line-clamp-2 font-bold transition hover:text-violet-400"
          >
            {item.title}
          </Link>
          <p className="mt-1 text-xs text-slate-400">
            {item.year} · {item.genre.slice(0, 2).join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleSave(item.id)}
          aria-label={saved ? `Remove ${item.title} from watchlist` : `Save ${item.title} to watchlist`}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}