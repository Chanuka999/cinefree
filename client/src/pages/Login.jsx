import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clapperboard, LoaderCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...(mode === "register" ? { name } : {}), email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed.");
      localStorage.setItem("cinefree-token", data.token);
      localStorage.setItem("cinefree-user", JSON.stringify(data.user));
      navigate("/", { replace: true });
    } catch (err) { setError(err.message || "Unable to connect to CineFree API."); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-9">
      <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-black"><span className="grid size-10 place-items-center rounded-xl bg-violet-600"><Clapperboard size={22}/></span>Cine<span className="text-violet-400">Free</span></Link>
      <h1 className="text-3xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-slate-400">{mode === "login" ? "Sign in to continue to CineFree." : "Register for a CineFree account."}</p>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {mode === "register" && <label className="block text-sm font-medium">Name<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-500"/></label>}
        <label className="block text-sm font-medium">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-500"/></label>
        <label className="block text-sm font-medium">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode === "register" ? 10 : 1} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-violet-500"/>{mode === "register" && <span className="mt-1 block text-xs text-slate-500">Use 10–72 characters.</span>}</label>
        {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500 disabled:opacity-60">{loading && <LoaderCircle size={18} className="animate-spin"/>}{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">{mode === "login" ? "New to CineFree?" : "Already have an account?"} <button type="button" onClick={()=>{setMode(mode === "login" ? "register" : "login");setError("");}} className="font-semibold text-violet-300 hover:text-white">{mode === "login" ? "Create account" : "Sign in"}</button></p>
    </div>
  </main>;
}
