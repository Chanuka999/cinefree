import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Film,
  Tv,
  Search,
  Save,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LoaderCircle,
  Play,
  Download,
  Users,
  UserCheck,
  Trash2,
  Edit3,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import {
  fetchMedia,
  saveMediaSource,
  fetchAdminMediaList,
  deleteAdminMediaSource,
  fetchAdminUsers,
  updateAdminUserRole
} from "../services/api";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("media"); // 'media' | 'users' | 'add'

  // Admin user context
  const token = localStorage.getItem("cinefree-token");
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("cinefree-user") || "null");
    } catch {
      return null;
    }
  })();
  const isAdmin = storedUser?.role === "admin";

  // Available Media state
  const [adminMediaList, setAdminMediaList] = useState([]);
  const [mediaStats, setMediaStats] = useState({
    total: 0,
    moviesCount: 0,
    seriesCount: 0,
    watchableCount: 0,
    downloadableCount: 0,
    watchableMoviesCount: 0,
    downloadableMoviesCount: 0,
    watchableSeriesCount: 0,
    downloadableSeriesCount: 0,
    publishedCount: 0,
  });
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState("all"); // 'all' | 'movie' | 'series' | 'watchable' | 'downloadable'
  const [mediaSearch, setMediaSearch] = useState("");

  // Registered Users state
  const [usersList, setUsersList] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Add / Edit mapping form state
  const [query, setQuery] = useState("");
  const [type, setType] = useState("movie");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [rightsStatus, setRightsStatus] = useState("licensed");
  const [published, setPublished] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Notifications
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load Admin Media List
  async function loadAdminMedia() {
    if (!token) return;
    setLoadingMedia(true);
    try {
      const data = await fetchAdminMediaList();
      setAdminMediaList(data.results || []);
      if (data.stats) setMediaStats(data.stats);
    } catch (err) {
      console.warn("Could not load media list:", err.message);
    } finally {
      setLoadingMedia(false);
    }
  }

  // Load Admin Users List
  async function loadAdminUsers() {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const data = await fetchAdminUsers();
      setUsersList(data.users || []);
      if (data.stats) setUserStats(data.stats);
    } catch (err) {
      console.warn("Could not load users list:", err.message);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadAdminMedia();
      loadAdminUsers();
    }
  }, [token]);

  // Search TMDB for adding / mapping
  async function searchTitles(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSelected(null);
    setResults([]);
    if (query.trim().length < 2) {
      setError("Type at least 2 characters to search TMDB.");
      return;
    }
    setLoadingSearch(true);
    try {
      const data = await fetchMedia({ type, search: query.trim(), page: 1 });
      setResults(data.results || []);
      if (!(data.results || []).length) {
        setNotice("No matching titles found on TMDB. Try another title.");
      }
    } catch (err) {
      setError(err.message || "TMDB search failed.");
    } finally {
      setLoadingSearch(false);
    }
  }

  function chooseTitle(item) {
    setSelected(item);
    setType(item.type);
    setError("");
    setNotice("");
  }

  // Handle Save / Update Media Source
  async function handleSave(event) {
    event.preventDefault();
    if (!selected) {
      setError("Search and select the exact movie or series first.");
      return;
    }
    if (!embedUrl.trim() && !videoUrl.trim() && !downloadUrl.trim()) {
      setError("Add at least one authorized embed, video, or download URL.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveMediaSource({
        tmdbId: selected.tmdbId,
        type: selected.type,
        embedUrl: embedUrl.trim(),
        videoUrl: videoUrl.trim(),
        downloadUrl: downloadUrl.trim(),
        rightsStatus,
        published,
      });
      setNotice(`Saved “${selected.title}” (TMDB ID: ${selected.tmdbId}) successfully.`);
      // Refresh available media list and switch to list tab
      await loadAdminMedia();
    } catch (err) {
      setError(err.message || "Could not save the media source.");
    } finally {
      setSaving(false);
    }
  }

  // Edit existing media item from the list
  function handleEditExisting(item) {
    setSelected({
      tmdbId: item.tmdbId,
      type: item.type,
      title: item.title,
      poster: item.posterUrl,
      year: item.releaseYear,
    });
    setType(item.type);
    setEmbedUrl(item.embedUrl || "");
    setVideoUrl(item.videoUrl || "");
    setDownloadUrl(item.downloadUrl || "");
    setRightsStatus(item.rights?.status || "licensed");
    setPublished(item.published !== false);
    setActiveTab("add");
    setNotice(`Loaded "${item.title}" into the editor.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Delete media item
  async function handleDeleteMedia(id, title) {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the available media database?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAdminMediaSource(id);
      setNotice(`Removed "${title}" from the database.`);
      await loadAdminMedia();
    } catch (err) {
      setError(err.message || "Failed to delete media.");
    } finally {
      setDeletingId(null);
    }
  }

  // Update user role
  async function handleToggleRole(user) {
    const newRole = user.role === "admin" ? "user" : "admin";
    const confirmMsg = user.role === "admin"
      ? `Demote ${user.name} from Admin to Standard User?`
      : `Promote ${user.name} to Administrator?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingUserId(user._id);
    try {
      await updateAdminUserRole(user._id, newRole);
      setNotice(`Updated role for ${user.name} to "${newRole}".`);
      await loadAdminUsers();
    } catch (err) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // Filter available media list
  const filteredMedia = adminMediaList.filter((item) => {
    const matchesSearch =
      !mediaSearch.trim() ||
      item.title.toLowerCase().includes(mediaSearch.trim().toLowerCase()) ||
      String(item.tmdbId).includes(mediaSearch.trim());

    if (!matchesSearch) return false;

    if (mediaFilter === "movie") return item.type === "movie";
    if (mediaFilter === "series") return item.type === "series";
    if (mediaFilter === "watchable") return Boolean(item.embedUrl || item.videoUrl);
    if (mediaFilter === "downloadable") return Boolean(item.downloadUrl);

    return true;
  });

  // Filter users list
  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const term = userSearch.trim().toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
  });

  return (
    <section className="mx-auto min-h-screen max-w-[1600px] px-4 py-10 md:px-10">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-violet-400">
            <Sparkles size={14} /> ADMINISTRATION & CONTROL CENTER
          </div>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor available streaming & download catalog, manage registered user accounts, and configure TMDB titles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {storedUser && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-600 font-bold text-white">
                {storedUser.name ? storedUser.name.charAt(0).toUpperCase() : "A"}
              </span>
              <div>
                <p className="font-bold leading-tight text-white">{storedUser.name}</p>
                <p className="text-xs text-violet-300 font-medium capitalize">{storedUser.role} Account</p>
              </div>
            </div>
          )}
          <Link
            to="/"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Back to Site
          </Link>
        </div>
      </div>

      {/* Auth Warning Banners */}
      {!token ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="shrink-0 text-amber-400" />
            <div>
              <h2 className="font-bold">You are currently not signed in</h2>
              <p className="text-sm text-amber-300/80">
                Please sign in with an Administrator account to view registered users and configure video sources.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
          >
            Sign In Now
          </Link>
        </div>
      ) : !isAdmin ? (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="shrink-0 text-amber-400" />
            <div>
              <h2 className="font-bold">Standard User Account Detected</h2>
              <p className="text-sm text-amber-300/80">
                Your account ({storedUser?.email}) has role <code className="font-mono text-white">user</code>. Administrator privileges are required to view the full user list and save media sources.
                To promote this account, run <code className="rounded bg-black/40 px-2 py-0.5 text-white">npm run promote-admin -- {storedUser?.email}</code> in your server terminal.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Global Alerts */}
      {error && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-xs text-rose-400 hover:text-white">Dismiss</button>
        </div>
      )}
      {notice && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-xs text-emerald-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Primary KPI Overview Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Available Movies & TV Series */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Titles</span>
            <span className="grid size-9 place-items-center rounded-xl bg-violet-600/20 text-violet-400">
              <Film size={20} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{mediaStats.total}</span>
            <span className="text-xs text-slate-400">titles configured</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-violet-500/20 px-2 py-0.5 font-semibold text-violet-300">
              🎬 {mediaStats.moviesCount} Movies
            </span>
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-semibold text-indigo-300">
              📺 {mediaStats.seriesCount} TV Series
            </span>
          </div>
        </div>

        {/* Card 2: Watchable Online */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Watchable Online</span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Play size={20} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{mediaStats.watchableCount}</span>
            <span className="text-xs text-slate-400">playable stream sources</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
            <span>{mediaStats.watchableMoviesCount} Movies · {mediaStats.watchableSeriesCount} TV Series ready to stream</span>
          </div>
        </div>

        {/* Card 3: Downloadable */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Download Ready</span>
            <span className="grid size-9 place-items-center rounded-xl bg-sky-500/20 text-sky-400">
              <Download size={20} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-400">{mediaStats.downloadableCount}</span>
            <span className="text-xs text-slate-400">direct download links</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
            <span>{mediaStats.downloadableMoviesCount} Movies · {mediaStats.downloadableSeriesCount} TV Series ready to download</span>
          </div>
        </div>

        {/* Card 4: Registered Users */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Registered Accounts</span>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
              <Users size={20} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{userStats.totalUsers}</span>
            <span className="text-xs text-slate-400">total accounts</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-300">
              🛡️ {userStats.adminUsers} Admins
            </span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-slate-300">
              👤 {userStats.regularUsers} Regular
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              activeTab === "media"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Film size={18} />
            <span>Available Media ({adminMediaList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              activeTab === "users"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users size={18} />
            <span>Registered Users ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              activeTab === "add"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <PlusCircle size={18} />
            <span>{selected ? "Edit Title Mapping" : "Map New Title"}</span>
          </button>
        </div>

        {activeTab === "media" && (
          <button
            onClick={loadAdminMedia}
            disabled={loadingMedia}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingMedia ? "animate-spin text-violet-400" : ""} />
            <span>Refresh Media</span>
          </button>
        )}

        {activeTab === "users" && (
          <button
            onClick={loadAdminUsers}
            disabled={loadingUsers}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingUsers ? "animate-spin text-violet-400" : ""} />
            <span>Refresh Users</span>
          </button>
        )}
      </div>

      {/* TAB 1: AVAILABLE MOVIES & TV SERIES LIST */}
      {activeTab === "media" && (
        <div className="mt-6 space-y-6">
          {/* Subheader & Search / Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: "all", label: `All Titles (${adminMediaList.length})` },
                { id: "movie", label: `Movies (${mediaStats.moviesCount})` },
                { id: "series", label: `TV Series (${mediaStats.seriesCount})` },
                { id: "watchable", label: `Watchable (${mediaStats.watchableCount})` },
                { id: "downloadable", label: `Downloadable (${mediaStats.downloadableCount})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setMediaFilter(pill.id)}
                  className={`rounded-xl px-3.5 py-2 font-semibold transition ${
                    mediaFilter === pill.id
                      ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                      : "bg-white/[0.03] text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Media Search Input */}
            <div className="relative min-w-[280px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search by title name or TMDB ID..."
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Media Items Table / Grid */}
          {loadingMedia ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-20">
              <LoaderCircle size={36} className="animate-spin text-violet-500" />
              <p className="mt-4 text-sm text-slate-400">Loading catalog from database...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
              <Film size={48} className="text-slate-600" />
              <h2 className="mt-4 text-xl font-bold">No movies or TV series found</h2>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                {adminMediaList.length === 0
                  ? "You have not added any movies or TV series yet. Switch to the 'Map New Title' tab to find titles on TMDB and save embed/download URLs."
                  : "No items match your active search or filter criteria. Try clearing the search or switching filters."}
              </p>
              {adminMediaList.length === 0 && (
                <button
                  onClick={() => setActiveTab("add")}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold hover:bg-violet-500"
                >
                  <PlusCircle size={18} /> Add First Title Now
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 pl-6 pr-4">Media Title & Poster</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Watch Status</th>
                    <th className="px-4 py-4">Download Status</th>
                    <th className="px-4 py-4">Rights / Visibility</th>
                    <th className="py-4 pl-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredMedia.map((item) => {
                    const hasWatch = Boolean(item.embedUrl?.trim() || item.videoUrl?.trim());
                    const hasDownload = Boolean(item.downloadUrl?.trim());

                    return (
                      <tr key={item._id || item.slug} className="transition hover:bg-white/[0.03]">
                        {/* Title & Poster */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-4">
                            {item.posterUrl ? (
                              <img
                                src={item.posterUrl}
                                alt={item.title}
                                className="h-16 w-11 rounded-lg object-cover shadow"
                              />
                            ) : (
                              <div className="grid h-16 w-11 place-items-center rounded-lg bg-white/10 text-slate-400">
                                <Film size={18} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-white leading-snug">{item.title}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                <span>{item.releaseYear || "Unknown Year"}</span>
                                <span>•</span>
                                <span className="text-violet-300 font-mono">TMDB #{item.tmdbId}</span>
                                {item.rating > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-400">★ {item.rating}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              item.type === "movie"
                                ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                                : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {item.type === "movie" ? <Film size={12} /> : <Tv size={12} />}
                            {item.type === "movie" ? "Movie" : "TV Series"}
                          </span>
                        </td>

                        {/* Watch Status */}
                        <td className="px-4 py-4">
                          {hasWatch ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                              <Play size={12} fill="currentColor" /> Watch Available
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <XCircle size={13} /> No player link
                            </span>
                          )}
                        </td>

                        {/* Download Status */}
                        <td className="px-4 py-4">
                          {hasDownload ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400">
                              <Download size={12} /> Download Available
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <XCircle size={13} /> No download link
                            </span>
                          )}
                        </td>

                        {/* Rights & Visibility */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="capitalize text-slate-300 font-medium">
                              {item.rights?.status || "licensed"}
                            </span>
                            <span
                              className={`inline-block font-semibold ${
                                item.published ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              {item.published ? "● Published" : "○ Draft"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Watch Link */}
                            <Link
                              to={`/watch/${item.slug || `${item.type}-${item.tmdbId}`}`}
                              target="_blank"
                              title="Preview Watch Page"
                              className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-violet-600 hover:text-white"
                            >
                              <Play size={15} />
                            </Link>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditExisting(item)}
                              title="Edit URLs & Mappings"
                              className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                            >
                              <Edit3 size={15} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteMedia(item._id, item.title)}
                              disabled={deletingId === item._id}
                              title="Delete from database"
                              className="rounded-lg border border-white/10 p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-50"
                            >
                              {deletingId === item._id ? (
                                <LoaderCircle size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTERED USERS DETAILS */}
      {activeTab === "users" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Registered Users Management</h2>
              <p className="text-xs text-slate-400">
                View all registered users, roles, and registration dates.
              </p>
            </div>

            {/* User Search */}
            <div className="relative min-w-[280px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-20">
              <LoaderCircle size={36} className="animate-spin text-violet-500" />
              <p className="mt-4 text-sm text-slate-400">Loading registered users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
              <Users size={48} className="text-slate-600" />
              <h2 className="mt-4 text-xl font-bold">No users found</h2>
              <p className="mt-2 text-sm text-slate-400">
                {usersList.length === 0
                  ? "No registered users in the database yet, or admin credentials are required."
                  : "No users matched your search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 pl-6 pr-4">User</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">Joined Date</th>
                    <th className="py-4 pl-4 pr-6 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((u) => {
                    const isSelf = storedUser && storedUser.id === u._id;
                    const dateFormatted = u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";

                    return (
                      <tr key={u._id} className="transition hover:bg-white/[0.03]">
                        {/* Avatar & Name */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow">
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </span>
                            <div>
                              <p className="font-bold text-white">
                                {u.name} {isSelf && <span className="text-xs text-violet-400">(You)</span>}
                              </p>
                              <p className="font-mono text-xs text-slate-500">ID: {u._id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 text-slate-300 font-mono text-xs">
                          {u.email}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          {u.role === "admin" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-600/20 px-2.5 py-1 text-xs font-bold text-violet-300">
                              <ShieldCheck size={14} className="text-violet-400" /> Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                              <UserCheck size={14} className="text-slate-400" /> Standard User
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-500" />
                            <span>{dateFormatted}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isSelf || updatingUserId === u._id}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                              u.role === "admin"
                                ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                                : "border-violet-500/30 text-violet-300 hover:bg-violet-600/20"
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={isSelf ? "You cannot modify your own role" : "Toggle user access role"}
                          >
                            {updatingUserId === u._id ? (
                              <LoaderCircle size={14} className="animate-spin inline" />
                            ) : u.role === "admin" ? (
                              "Demote to User"
                            ) : (
                              "Promote to Admin"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD / MAP VIDEO LINKS */}
      {activeTab === "add" && (
        <div className="mt-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {selected ? `Configure Mapping: ${selected.title}` : "Search TMDB & Map Video Source"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Connect TMDB metadata with authorized video embed and download links.
              </p>
            </div>
            {selected && (
              <button
                onClick={() => {
                  setSelected(null);
                  setEmbedUrl("");
                  setVideoUrl("");
                  setDownloadUrl("");
                }}
                className="rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Clear Selection / New Search
              </button>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            {/* Step 1: TMDB Search */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Search size={20} className="text-violet-400" /> 1. Find the title on TMDB
              </h3>
              <form onSubmit={searchTitles} className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                  <label className="text-sm text-slate-300">
                    Content type
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        setResults([]);
                        setSelected(null);
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-white"
                    >
                      <option value="movie">Movie</option>
                      <option value="series">TV Series</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-300">
                    Title name
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Inception, Stranger Things"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500"
                    />
                  </label>
                </div>
                <button
                  disabled={loadingSearch}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500 disabled:opacity-60"
                >
                  {loadingSearch ? <LoaderCircle size={18} className="animate-spin" /> : <Search size={18} />}{" "}
                  {loadingSearch ? "Searching TMDB..." : "Search TMDB"}
                </button>
              </form>

              <div className="mt-5 max-h-[460px] overflow-y-auto space-y-3 pr-1">
                {results.map((item) => (
                  <button
                    key={`${item.type}-${item.tmdbId}`}
                    type="button"
                    onClick={() => chooseTitle(item)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition ${
                      selected?.tmdbId === item.tmdbId && selected?.type === item.type
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    {item.poster ? (
                      <img src={item.poster} alt="" className="h-20 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="grid h-20 w-14 place-items-center rounded-lg bg-white/10">
                        <Film />
                      </div>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{item.title}</span>
                      <span className="mt-1 block text-sm text-slate-400">
                        {item.year || "Year unknown"} · {item.type === "series" ? "TV Series" : "Movie"}
                      </span>
                      <span className="mt-1 block text-xs text-violet-300">TMDB ID: {item.tmdbId}</span>
                    </span>
                    {selected?.tmdbId === item.tmdbId && selected?.type === item.type && (
                      <ShieldCheck className="text-violet-300" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Confirm the title, release year, and poster before selecting.
              </p>
            </section>

            {/* Step 2: Configure Links */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Save size={20} className="text-violet-400" /> 2. Save video & download links
              </h3>

              {selected ? (
                <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-violet-300">Selected Title</p>
                  <p className="mt-1 text-lg font-bold">{selected.title}</p>
                  <p className="text-sm text-slate-300">
                    {selected.type === "series" ? "TV Series" : "Movie"} · TMDB ID: <strong>{selected.tmdbId}</strong>
                  </p>
                  <a
                    href={`https://www.themoviedb.org/${selected.type === "series" ? "tv" : "movie"}/${selected.tmdbId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-violet-300 hover:text-white"
                  >
                    Verify on TMDB <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
                  Search on the left and select the title you want to map.
                </p>
              )}

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <label className="block text-sm text-slate-300">
                  Embed URL (Watch online)
                  <input
                    type="url"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder="https://player.vimeo.com/video/... or YouTube embed"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  Direct Video URL (Optional mp4/stream)
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://.../video.mp4"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  Download URL (Download offline)
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://your-authorized-provider/download/..."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  Video Rights Status
                  <select
                    value={rightsStatus}
                    onChange={(e) => setRightsStatus(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-white"
                  >
                    <option value="licensed">Licensed</option>
                    <option value="permission">Permission obtained</option>
                    <option value="public-domain">Public domain</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="size-4 accent-violet-500"
                  />
                  <span>Publish this video mapping (make available to watch and download)</span>
                </label>

                <button
                  disabled={saving || !selected}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving to MongoDB..." : "Save Source Mapping"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </section>
  );
}
