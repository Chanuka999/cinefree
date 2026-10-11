import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, PlayCircle } from "lucide-react";
import { fetchMediaDetails } from "../services/api";

// Only render iframe URLs from known video-hosting providers. Add a provider
// here after checking its official embed URL format.
const ALLOWED_EMBED_HOSTS = [
  "youtube.com", "www.youtube.com",
  "youtube-nocookie.com", "www.youtube-nocookie.com",
  "drive.google.com", "docs.google.com",
  "mega.nz", "www.mega.nz",
  "vk.com", "www.vk.com",
  "player.vimeo.com", "vimeo.com",
  "playmogo.com", "www.playmogo.com",
];
function isAllowedEmbedUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_EMBED_HOSTS.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function isHttpUrl(value) {
  if (!value) return false;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const match = id?.match(/^(movie|series)-(\d+)$/);
    if (!match) {
      setError("Invalid title URL.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchMediaDetails(match[1], match[2])
      .then((data) => {
        if (!controller.signal.aborted) setItem(data.result);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || "Could not load this title.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  if (loading) return <p className="p-16 text-center text-slate-400">Loading player...</p>;
  if (error || !item) return <p className="p-16 text-center text-rose-400">{error || "Title not found."}</p>;

  const seasonNo = Number(params.get("season") || 1);
  const episodeNo = Number(params.get("episode") || 1);
  const embedUrl = isAllowedEmbedUrl(item.embedUrl) ? item.embedUrl : "";
  const videoUrl = isHttpUrl(item.videoUrl) ? item.videoUrl : "";
  const downloadUrl = isHttpUrl(item.downloadUrl) ? item.downloadUrl : "";

  return (
    <section className="mx-auto min-h-screen max-w-[1500px] px-4 py-8 md:px-10">
      <Link to={`/title/${item.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={17} /> Back to details
      </Link>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Watch ${item.title}`}
                className="aspect-video w-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : videoUrl ? (
              <video controls playsInline preload="metadata" poster={item.backdrop} className="aspect-video w-full">
                <source src={videoUrl} />
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#050816] px-5 text-center">
                <PlayCircle size={56} className="text-violet-400" />
                <h2 className="mt-5 text-xl font-bold">Player source not configured</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  Add a licensed provider embed URL or direct video URL to this title in the media database. Ordinary watch-page URLs may not work in an iframe; use the provider's official embed URL.
                </p>
              </div>
            )}
          </div>
          <h1 className="mt-6 text-2xl font-extrabold">{item.title}</h1>
          <p className="mt-2 leading-7 text-slate-400">{item.description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {downloadUrl && (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500">
                <Download size={18} /> Download
              </a>
            )}
            {item.videoProvider && <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300"><ExternalLink size={16} /> Source: {item.videoProvider}</span>}
          </div>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold">Now watching</h2>
          <p className="mt-2 text-sm text-slate-400">{item.title}</p>
          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold">Content rights</h3>
            <p className="mt-2 text-xs leading-6 text-slate-400">{item.rights}</p>
            <p className="mt-3 text-xs leading-6 text-slate-500">Only use embed and download links for content you own, have licensed, or are authorized to distribute.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
