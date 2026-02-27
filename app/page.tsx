"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Demo User", role: "filer" }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[120px]" />

      <div className="text-center max-w-2xl mx-auto animate-fade-in relative z-10">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-2">
            <span className="text-5xl">&#9992;&#65039;</span>
          </div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          TaxPilot AI
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 mb-2">
          Your AI Co-Pilot for Tax Season
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Powered by DigitalOcean Gradient AI &bull; Reviewed by Licensed Professionals
        </p>

        {/* Stats bar */}
        <div className="flex justify-center gap-8 mb-8 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">5</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">AI Agents</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div>
            <p className="text-2xl font-bold text-emerald-400">$0</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Filing Fee</p>
          </div>
          <div className="w-px bg-slate-700" />
          <div>
            <p className="text-2xl font-bold text-cyan-400">EA</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Human Review</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="card text-center hover:border-blue-500/40 transition-colors">
            <div className="text-2xl mb-2">&#129302;</div>
            <h3 className="font-semibold text-sm mb-1">AI-Powered Filing</h3>
            <p className="text-xs text-slate-500">Multi-agent LangGraph pipeline finds every deduction using IRS knowledge base</p>
          </div>
          <div className="card text-center hover:border-emerald-500/40 transition-colors">
            <div className="text-2xl mb-2">&#128104;&#8205;&#128188;</div>
            <h3 className="font-semibold text-sm mb-1">Human-in-the-Loop</h3>
            <p className="text-xs text-slate-500">Licensed Enrolled Agent reviews flagged items for accuracy and optimization</p>
          </div>
          <div className="card text-center hover:border-cyan-500/40 transition-colors">
            <div className="text-2xl mb-2">&#128241;</div>
            <h3 className="font-semibold text-sm mb-1">Mobile-First PWA</h3>
            <p className="text-xs text-slate-500">Snap W-2 photos with your camera, file from anywhere, works offline</p>
          </div>
        </div>

        {/* Tech badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Gradient ADK", "LangGraph", "Llama 3.3 70B", "Knowledge Base RAG", "DO App Platform", "PostgreSQL", "Spaces", "Agent Tracing"].map((tech) => (
            <span key={tech} className="px-2.5 py-1 text-[10px] rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {tech}
            </span>
          ))}
        </div>

        <div className="max-w-sm mx-auto space-y-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            className="input-field text-center"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full text-lg py-3 font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {loading ? "Starting..." : "Start Filing \u2014 Free"}
          </button>
          <p className="text-xs text-slate-600">
            Demo mode &mdash; no account required
          </p>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-slate-600 relative z-10">
        <p>Patent Pending: Virtual Accounting Agent with Human-in-the-Loop (USPTO #020)</p>
        <p className="mt-1">Built for DigitalOcean Gradient AI Hackathon 2026 &bull; <a href="https://github.com/AIoOS-67/taxpilot-ai" className="text-blue-500 hover:underline">GitHub</a></p>
      </footer>
    </main>
  );
}
