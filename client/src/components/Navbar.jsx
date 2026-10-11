
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Clapperboard, Search, Bookmark, Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "TV Series", to: "/series" },
  { label: "Browse", to: "/browse" },
];

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();
    navigate(`/browse?search=${encodeURIComponent(search)}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b19]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-5 px-4 py-4 md:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-white">
            <Clapperboard size={21} />
          </span>
          Cine<span className="text-violet-400">Free</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-violet-400" : "text-slate-300 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-sm flex-1 md:flex">
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 focus-within:border-violet-500">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies, series..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
        </form>

        <Link
          to="/watchlist"
          aria-label="Watchlist"
          className="hidden rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white sm:block"
        >
          <Bookmark size={20} />
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="ml-auto rounded-xl p-2 hover:bg-white/10 md:ml-0 lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-white/10 p-4 lg:hidden">
          <form onSubmit={handleSearch} className="flex gap-2 rounded-xl bg-white/5 p-3">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </form>
          {navItems.map((item) => (
            <Link
              key={item.to}
              onClick={() => setMobileOpen(false)}
              to={item.to}
              className="block py-2 text-sm text-slate-300 hover:text-violet-400"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/watchlist" onClick={() => setMobileOpen(false)} className="block py-2">
            My Watchlist
          </Link>
        </div>
      )}
    </header>
  );
}
