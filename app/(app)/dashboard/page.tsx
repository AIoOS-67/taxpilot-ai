"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProgressTracker from "@/components/ProgressTracker";

interface SessionSummary {
  id: string;
  status: string;
  confidence_score: number | null;
  estimated_refund: number | null;
  updated_at: string;
}

export default function DashboardPage() {
  const [session, setSession] = useState<SessionSummary | null>(null);
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        setSession(data.session);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Your 2025 tax return overview</p>
      </div>

      <ProgressTracker currentStep={session?.status || "intake"} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/interview" className="card hover:border-blue-500/50 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{"\ud83d\udcac"}</span>
            <div>
              <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                {session ? "Continue Filing" : "Start Filing"}
              </h3>
              <p className="text-sm text-slate-500">Chat with TaxPilot AI</p>
            </div>
          </div>
        </Link>

        <Link href="/upload" className="card hover:border-blue-500/50 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{"\ud83d\udcf8"}</span>
            <div>
              <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Upload W-2</h3>
              <p className="text-sm text-slate-500">Snap a photo or upload file</p>
            </div>
          </div>
        </Link>

        <Link href="/result" className="card hover:border-blue-500/50 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{"\ud83d\udccb"}</span>
            <div>
              <h3 className="font-semibold group-hover:text-blue-400 transition-colors">View Results</h3>
              <p className="text-sm text-slate-500">Form 1040 preview & refund</p>
            </div>
          </div>
        </Link>

        <Link href="/review-status" className="card hover:border-blue-500/50 transition-colors group">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{"\u2705"}</span>
            <div>
              <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Review Status</h3>
              <p className="text-sm text-slate-500">Professional review progress</p>
            </div>
          </div>
        </Link>
      </div>

      {session && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card text-center">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <p className="font-semibold text-sm capitalize">{session.status.replace(/_/g, ' ')}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 mb-1">Confidence</p>
            <p className="font-semibold text-sm">
              {session.confidence_score ? `${Math.round(session.confidence_score * 100)}%` : '\u2014'}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 mb-1">Est. Refund</p>
            <p className="font-semibold text-sm text-emerald-400">
              {session.estimated_refund ? `$${session.estimated_refund.toLocaleString()}` : '\u2014'}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-slate-500 mb-1">Updated</p>
            <p className="font-semibold text-sm">
              {session.updated_at ? new Date(session.updated_at).toLocaleDateString() : '\u2014'}
            </p>
          </div>
        </div>
      )}

      <div className="card border-blue-900/50 bg-blue-950/20">
        <div className="flex gap-3">
          <span className="text-lg">{"\u2139\ufe0f"}</span>
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">How TaxPilot Works</p>
            <ol className="list-decimal list-inside text-slate-400 space-y-1">
              <li>Chat with our AI to provide your tax information</li>
              <li>Upload W-2s and tax documents with your camera</li>
              <li>AI finds deductions and calculates your return</li>
              <li>A licensed EA reviews flagged items for accuracy</li>
              <li>View your completed Form 1040 and estimated refund</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
