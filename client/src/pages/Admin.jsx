import { useState } from "react";
import { Link } from "react-router-dom";
import { Film, Search, Save, ExternalLink, ShieldCheck, LoaderCircle } from "lucide-react";
import { fetchMedia, saveMediaSource } from "../services/api";

export default function Admin() {
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function searchTitles(event) {
    event.preventDefault();
    setError(""); setNotice(""); setSelected(null); setResults([]);
    if (query.trim().length < 2) { setError("Type at least 2 characters to search TMDB."); return; }
    setLoadingSearch(true);
    try {
      const data = await fetchMedia({ type, search: query.trim(), page: 1 });
      setResults(data.results || []);
      if (!(data.results || []).length) setNotice("No matching titles found. Try another spelling.");
    } catch (err) { setError(err.message || "TMDB search failed."); }
    finally { setLoadingSearch(false); }
  }

  function chooseTitle(item) {
    setSelected(item);
    setType(item.type);
    setError(""); setNotice("");
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selected) { setError("Search and select the exact movie or series first."); return; }
    if (!embedUrl.trim() && !videoUrl.trim() && !downloadUrl.trim()) {
      setError("Add at least one authorized embed, video, or download URL."); return;
    }
    setSaving(true); setError(""); setNotice("");
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
      setNotice(`Saved “${selected.title}” (TMDB ID: ${selected.tmdbId}) to MongoDB.`);
    } catch (err) { setError(err.message || "Could not save the source."); }
    finally { setSaving(false); }
  }

  return (
    <section className="mx-auto min-h-screen max-w-[1500px] px-5 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-violet-400">Management</p>
          <h1 className="mt-2 text-4xl font-black">Admin Dashboard</h1>
          <p className="mt-3 text-slate-400">Search TMDB, select the correct title, and save its video source mapping.</p>
        </div>
        <Link to="/" className="rounded-xl border border-white/10 px-4 py-3 font-semibold hover:bg-white/5">Back to site</Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Search size={20} className="text-violet-400"/> 1. Find the title on TMDB</h2>
          <form onSubmit={searchTitles} className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
              <label className="text-sm text-slate-300">Content type
                <select value={type} onChange={e => { setType(e.target.value); setResults([]); setSelected(null); }} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-white">
                  <option value="movie">Movie</option><option value="series">TV Series</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Title name
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Interstellar" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500" />
              </label>
            </div>
            <button disabled={loadingSearch} className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500 disabled:opacity-60">
              {loadingSearch ? <LoaderCircle size={18} className="animate-spin"/> : <Search size={18}/>} {loadingSearch ? "Searching..." : "Search TMDB"}
            </button>
          </form>
          <div className="mt-5 space-y-3">
            {results.map(item => <button key={`${item.type}-${item.tmdbId}`} type="button" onClick={() => chooseTitle(item)} className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition ${selected?.tmdbId === item.tmdbId && selected?.type === item.type ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:bg-white/5"}`}>
              {item.poster ? <img src={item.poster} alt="" className="h-20 w-14 rounded-lg object-cover"/> : <div className="grid h-20 w-14 place-items-center rounded-lg bg-white/10"><Film/></div>}
              <span className="min-w-0 flex-1"><span className="block font-bold">{item.title}</span><span className="mt-1 block text-sm text-slate-400">{item.year || "Year unknown"} · {item.type === "series" ? "TV Series" : "Movie"}</span><span className="mt-1 block text-xs text-violet-300">TMDB ID: {item.tmdbId}</span></span>
              {selected?.tmdbId === item.tmdbId && selected?.type === item.type && <ShieldCheck className="text-violet-300"/>}
            </button>)}
          </div>
          <p className="mt-4 text-xs text-slate-500">Confirm the title, release year, and poster before selecting. Similar titles can have different TMDB IDs.</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Save size={20} className="text-violet-400"/> 2. Save video links</h2>
          {selected ? <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-xs uppercase tracking-wider text-violet-300">Selected title</p><p className="mt-1 text-lg font-bold">{selected.title}</p><p className="text-sm text-slate-300">{selected.type} · TMDB ID: <strong>{selected.tmdbId}</strong></p>
            <a href={`https://www.themoviedb.org/${selected.type === "series" ? "tv" : "movie"}/${selected.tmdbId}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-violet-300 hover:text-white">Verify on TMDB <ExternalLink size={14}/></a>
          </div> : <p className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">Search above and select the correct result. The selected TMDB ID will be saved automatically.</p>}
          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <label className="block text-sm text-slate-300">Embed URL (Watch)
              <input type="url" value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} placeholder="https://your-authorized-provider/embed/..." className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500" />
            </label>
            <label className="block text-sm text-slate-300">Direct video URL (optional)
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://.../video.mp4" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500" />
            </label>
            <label className="block text-sm text-slate-300">Download URL
              <input type="url" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)} placeholder="https://your-authorized-provider/download/..." className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-violet-500" />
            </label>
            <label className="block text-sm text-slate-300">Video rights status
              <select value={rightsStatus} onChange={e => setRightsStatus(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-white">
                <option value="licensed">Licensed</option><option value="permission">Permission obtained</option><option value="public-domain">Public domain</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="size-4 accent-violet-500"/> Publish this video mapping (make it available on the site)</label>
            {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
            <button disabled={saving || !selected} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoaderCircle size={18} className="animate-spin"/> : <Save size={18}/>} {saving ? "Saving to MongoDB..." : "Save source mapping"}
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-500">Only use video URLs you own or are authorized to distribute. Admin login is required to save.</p>
        </section>
      </div>
    </section>
  );
}
