
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-white/10 bg-[#070b19] px-5 py-10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-black text-white">
            Cine<span className="text-violet-400">Free</span>
          </p>
          <p>Free to explore. Watch and download authorized content.</p>
          <div className="flex gap-5">
            <a href="#license" className="hover:text-white">Content rights</a>
            <a href="mailto:contact@example.com" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
