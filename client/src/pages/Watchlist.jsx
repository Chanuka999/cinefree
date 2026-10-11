
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import MovieCard from "../components/MovieCard";
import { media } from "../data/media";

export default function Watchlist({ watchlist, onToggleSave }) {
  const savedItems = media.filter((item) => watchlist.includes(item.id));

  return (
    <section className="mx-auto min-h-[65vh] max-w-[1500px] px-5 py-12 md:px-10">
      <div className="flex items-center gap-3">
        <Bookmark className="text-violet-400" size={28} />
        <h1 className="text-3xl font-black">My Watchlist</h1>
      </div>
      <p className="mt-3 text-slate-400">Your saved movies and series.</p>

      {savedItems.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {savedItems.map((item) => (
            <MovieCard key={item.id} item={item} saved onToggleSave={onToggleSave} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <Bookmark size={40} className="mx-auto text-slate-500" />
          <h2 className="mt-4 text-xl font-bold">Your list is empty</h2>
          <p className="mt-2 text-sm text-slate-400">Save movies and series to find them here.</p>
          <Link to="/browse" className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 font-bold">
            Explore library
          </Link>
        </div>
      )}
    </section>
  );
}
