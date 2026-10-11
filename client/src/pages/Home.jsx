
import { Link } from "react-router-dom";
import { ChevronRight, Film, Sparkles } from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import MovieCard from "../components/MovieCard";
import useMedia from "../hooks/useMedia";

function MediaSection({ title, items, loading, error, watchlist, onToggleSave }) {
  return (
    <section className="mx-auto max-w-[1600px] px-5 py-7 md:px-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold md:text-2xl">{title}</h2>
        <Link to="/browse" className="flex items-center gap-1 text-sm text-violet-400">
          View all <ChevronRight size={17} />
        </Link>
      </div>

      {loading && <p className="text-slate-400">Loading titles...</p>}
      {error && <p className="text-rose-400">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-slate-400">No titles found.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            saved={watchlist.includes(item.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home({ watchlist, onToggleSave }) {
  const trending = useMedia({ type: "movie", category: "trending" });
  const movies = useMedia({ type: "movie", category: "popular" });
  const series = useMedia({ type: "series", category: "popular" });

  const featured = trending.items[0] || movies.items[0];

  return (
    <>
      {featured ? (
        <HeroBanner item={featured} />
      ) : (
        <div className="flex min-h-[420px] items-center justify-center px-5">
          <p className="text-slate-400">
            {trending.loading ? "Loading featured titles..." : "Featured titles unavailable"}
          </p>
        </div>
      )}

      <div className="mx-auto flex max-w-[1500px] flex-wrap gap-3 px-5 pt-8 md:px-10">
        <Link to="/movies" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:border-violet-500">
          <Film size={18} className="text-violet-400" /> Browse Movies
        </Link>
        <Link to="/series" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:border-violet-500">
          <Sparkles size={18} className="text-violet-400" /> Discover Series
        </Link>
      </div>

      <MediaSection
        title="Trending Movies"
        items={trending.items}
        loading={trending.loading}
        error={trending.error}
        watchlist={watchlist}
        onToggleSave={onToggleSave}
      />

      <MediaSection
        title="Popular Movies"
        items={movies.items}
        loading={movies.loading}
        error={movies.error}
        watchlist={watchlist}
        onToggleSave={onToggleSave}
      />

      <MediaSection
        title="Popular TV Series"
        items={series.items}
        loading={series.loading}
        error={series.error}
        watchlist={watchlist}
        onToggleSave={onToggleSave}
      />
    </>
  );
}
