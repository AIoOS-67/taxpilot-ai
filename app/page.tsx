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
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <span className="text-6xl">&#9992;&#65039;</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          TaxPilot AI
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 mb-2">
          Your AI Co-Pilot for Tax Season
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Powered by DigitalOcean Gradient AI &bull; Reviewed by Licensed Professionals
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="card text-center">
            <div className="text-2xl mb-2">&#129302;</div>
            <h3 className="font-semibold text-sm mb-1">AI-Powered Filing</h3>
            <p className="text-xs text-slate-500">Multi-agent system finds every deduction</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">&#128104;&#8205;&#128188;</div>
            <h3 className="font-semibold text-sm mb-1">Human-in-the-Loop</h3>
            <p className="text-xs text-slate-500">Licensed EA reviews flagged items</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">&#128241;</div>
            <h3 className="font-semibold text-sm mb-1">Mobile-First PWA</h3>
            <p className="text-xs text-slate-500">Snap W-2 photos with your camera</p>
          </div>
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
            className="btn-primary w-full text-lg py-3"
          >
            {loading ? "Starting..." : "Start Filing \u2014 Free"}
          </button>
          <p className="text-xs text-slate-600">
            Demo mode &mdash; no account required
          </p>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-slate-600">
        <p>Patent Pending: Virtual Accounting Agent with Human-in-the-Loop (USPTO #020)</p>
        <p className="mt-1">Built for DigitalOcean Gradient AI Hackathon 2026</p>
      </footer>
    </main>
  );
}
