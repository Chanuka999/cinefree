
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Details from "./pages/Details";
import Watch from "./pages/Watch";
import Watchlist from "./pages/Watchlist";
import Admin from "./pages/Admin";

export default function App() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinefree-watchlist") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cinefree-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  function onToggleSave(id) {
    setWatchlist((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Home watchlist={watchlist} onToggleSave={onToggleSave} />}
        />
        <Route
          path="browse"
          element={<Browse watchlist={watchlist} onToggleSave={onToggleSave} />}
        />
        <Route
          path="movies"
          element={<Browse initialType="movie" watchlist={watchlist} onToggleSave={onToggleSave} />}
        />
        <Route
          path="series"
          element={<Browse initialType="series" watchlist={watchlist} onToggleSave={onToggleSave} />}
        />
        <Route
          path="title/:slug"
          element={<Details watchlist={watchlist} onToggleSave={onToggleSave} />}
        />
        <Route path="watch/:id" element={<Watch />} />
        <Route
          path="watchlist"
          element={<Watchlist watchlist={watchlist} onToggleSave={onToggleSave} />}
        />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
