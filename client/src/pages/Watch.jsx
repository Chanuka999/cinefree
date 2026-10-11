
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, PlayCircle } from "lucide-react";
import { media } from "../data/media";

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const item = media.find((entry) => entry.id === id);

  if (!item) {
    return <div className="p-20 text-center">Title not found.</div>;
  }

  const seasonNo = Number(params.get("season") || 1);
  const episodeNo = Number(params.get("episode") || 1);
  const season = item.seasons?.find((s) => s.number === seasonNo);
  const episode = season?.episodes.find((e) => e.number === episodeNo);
  const videoUrl = episode?.videoUrl || item.videoUrl;
  const downloadUrl = episode?.downloadUrl || item.downloadUrl;

  return (
    <section className="mx-auto min-h-screen max-w-[1500px] px-4 py-8 md:px-10">
      <Link to={`/title/${item.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={17} /> Back to details
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            {videoUrl ? (
              <video
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={item.backdrop}
                className="aspect-video w-full"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#050816] px-5 text-center">
                <PlayCircle size={56} className="text-violet-400" />
                <h2 className="mt-5 text-xl font-bold">Video source not configured</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Add a verified, authorized video URL in the content data or backend before playback can begin.
                </p>
              </div>
            )}
          </div>

          <h1 className="mt-6 text-2xl font-extrabold">
            {item.type === "series" && episode
              ? `S${seasonNo} E${episodeNo} — ${episode.title}`
              : item.title}
          </h1>
          <p className="mt-2 leading-7 text-slate-400">{item.description}</p>

          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500">
              <Download size={18} /> Authorized Download
            </a>
          )}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-bold">Now watching</h2>
          <p className="mt-2 text-sm text-slate-400">{item.title}</p>
          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold">Content license</h3>
            <p className="mt-2 text-xs leading-6 text-slate-400">{item.rights}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
