
import { Link } from "react-router-dom";
import { Film, Tv, Users, Download, Plus, ShieldCheck } from "lucide-react";
import { media } from "../data/media";

const stats = [
  { label: "Total Movies", value: "—", Icon: Film },
  { label: "TV Series", value: "—", Icon: Tv },
  { label: "Users", value: "—", Icon: Users },
  { label: "Downloads", value: "—", Icon: Download },
];

export default function Admin() {
  const movies = media.filter((item) => item.type === "movie");
  const series = media.filter((item) => item.type === "series");

  return (
    <section className="mx-auto min-h-screen max-w-[1500px] px-5 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-violet-400">Management</p>
          <h1 className="mt-2 text-4xl font-black">Admin Dashboard</h1>
          <p className="mt-3 text-slate-400">Manage the CineFree content library.</p>
        </div>
        <button
          disabled
          title="Connect the admin API to enable content creation"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold opacity-60"
        >
          <Plus size={18} /> Add Content
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{label}</span>
              <Icon className="text-violet-400" size={21} />
            </div>
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-2 text-xs text-slate-500">Requires backend integration</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-bold">Content Library</h2>
          <span className="text-xs text-slate-400">{media.length} demo records</span>
        </div>

        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-400">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Year</th>
              <th className="p-4">Rights</th>
            </tr>
          </thead>
          <tbody>
            {media.map((item) => (
              <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="p-4">
                  <Link to={`/title/${item.slug}`} className="font-semibold hover:text-violet-400">
                    {item.title}
                  </Link>
                </td>
                <td className="p-4 capitalize">{item.type}</td>
                <td className="p-4">{item.year}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-amber-400">
                    <ShieldCheck size={15} /> Needs verification
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
