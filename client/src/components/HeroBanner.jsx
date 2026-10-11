
import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";

export default function HeroBanner({ item }) {
  if (!item) return null;

  return (
    <section className="relative isolate min-h-[480px] overflow-hidden md:min-h-[570px]">
      <img
        src={item.backdrop}
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050816] via-[#050816]/75 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#050816] via-transparent to-[#050816]/20" />

      <div className="mx-auto flex min-h-[480px] max-w-[1600px] items-center px-5 py-16 md:min-h-[570px] md:px-10">
        <div className="max-w-2xl">
          <span className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
            Featured
          </span>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
            {item.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span>{item.year}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star size={15} fill="currentColor" /> {item.rating}
            </span>
            <span>•</span>
            <span>{item.genre.join(" · ")}</span>
          </div>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
            {item.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to={`/title/${item.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold transition hover:bg-violet-500"
            >
              <Play size={18} fill="currentColor" /> Explore Title
            </Link>
            <Link
              to={`/title/${item.slug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold backdrop-blur hover:bg-white/20"
            >
              <Info size={18} /> More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
