
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import useMedia from "../hooks/useMedia";

const genres = [
  "All", "Action", "Adventure", "Animation", "Comedy",
  "Crime", "Documentary", "Drama", "Family", "Fantasy",
  "Horror", "Mystery", "Romance", "Science Fiction", "Thriller",
];

export default function Browse({ watchlist, onToggleSave, initialType = "all" }) {
  const [params] = useSearchParams();
  const [type, setType] = useState(initialType);
  const [genre, setGenre] = useState(params.get("genre") || "All");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState(params.get("search") || "");

  const { items, loading, error } = useMedia({
    type,
    search,
  });

  const results = useMemo(() => {
    let filtered = items;

    if (genre !== "All") {
      filtered = filtered.filter((item) =>
        item.genre.some((value) => value.toLowerCase() === genre.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      if (sort === "newest") return (b.year || 0) - (a.year || 0);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.rating - a.rating;
    });
  }, [items, genre, sort]);

  return (
    <section className="mx-auto min-h-[65vh] max-w-[1500px] px-5 py-10 md:px-10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400">Discover</p>
      <h1 className="mt-2 text-4xl font-black">Browse Library</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search movies and series..."
        className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-violet-500"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-white/10 bg-[#101629] px-4 py-3">
          <option value="all">Movies & TV Series</option>
          <option value="movie">Movies</option>
          <option value="series">TV Series</option>
        </select>

        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="rounded-xl border border-white/10 bg-[#101629] px-4 py-3">
          {genres.map((value) => <option key={value}>{value}</option>)}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/10 bg-[#101629] px-4 py-3">
          <option value="popular">Highest rated</option>
          <option value="newest">Newest</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      <div className="mb-5 mt-8 flex justify-between">
        <h2 className="font-bold">Search results</h2>
        <span className="text-sm text-slate-400">{results.length} titles</span>
      </div>

      {loading && <p className="py-8 text-slate-400">Loading from CineFree API...</p>}
      {error && <p className="py-8 text-rose-400">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="py-8 text-slate-400">No matching titles found.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((item) => (
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
