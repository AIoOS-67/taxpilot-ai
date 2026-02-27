"use client";

import { useState } from "react";

interface ReviewQueueItem {
  id: string;
  session_id: string;
  user_name: string;
  field_name: string;
  field_value: string;
  reason: string;
  confidence: number;
  status: string;
  created_at: string;
}

export default function ReviewDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [selected, setSelected] = useState<ReviewQueueItem | null>(null);
  const [notes, setNotes] = useState("");

  function handleLogin() {
    if (pin === "1040") {
      setAuthenticated(true);
      loadItems();
    }
  }

  function loadItems() {
    fetch("/api/review?role=reviewer")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {
        setItems([
          {
            id: "1", session_id: "demo-session", user_name: "Demo User",
            field_name: "Filing Status Optimization", field_value: "single",
            reason: "User may qualify for Head of Household \u2014 has dependent child",
            confidence: 0.68, status: "pending", created_at: new Date().toISOString(),
          },
          {
            id: "2", session_id: "demo-session", user_name: "Demo User",
            field_name: "Charitable Deduction", field_value: "$5,200",
            reason: "Amount exceeds typical range for income level \u2014 verify receipts",
            confidence: 0.45, status: "pending", created_at: new Date().toISOString(),
          },
        ]);
      });
  }

  async function handleAction(action: "approved" | "rejected" | "modified") {
    if (!selected) return;
    try {
      await fetch("/api/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: action, reviewer_notes: notes }),
      });
    } catch {
      // Demo mode: update locally
    }
    setItems((prev) => prev.map((item) => item.id === selected.id ? { ...item, status: action } : item));
    setSelected(null);
    setNotes("");
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-sm w-full text-center">
          <span className="text-4xl block mb-4">{"\ud83d\udd10"}</span>
          <h1 className="text-xl font-bold mb-2">Reviewer Access</h1>
          <p className="text-sm text-slate-400 mb-6">Enter your reviewer PIN</p>
          <input
            type="password"
            placeholder="PIN"
            className="input-field text-center text-2xl tracking-widest mb-4"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button onClick={handleLogin} className="btn-primary w-full">Access Dashboard</button>
          <p className="text-xs text-slate-600 mt-3">Demo PIN: 1040</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">&#9992;&#65039;</span>
            <div>
              <h1 className="font-bold">TaxPilot Review Dashboard</h1>
              <p className="text-xs text-slate-500">Enrolled Agent &mdash; Human-in-the-Loop</p>
            </div>
          </div>
          <div className="badge-green">Reviewer: Darren</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Review Queue ({items.filter(i => i.status === 'pending').length} pending)</h2>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => { setSelected(item); setNotes(""); }}
                className={`card cursor-pointer transition-all ${
                  selected?.id === item.id ? "border-blue-500 ring-1 ring-blue-500/30" : "hover:border-slate-600"
                } ${item.status !== 'pending' ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{item.field_name}</p>
                    <p className="text-xs text-slate-500">{item.user_name} &bull; {item.session_id.slice(0, 8)}</p>
                  </div>
                  <span className={`badge ${item.confidence < 0.5 ? 'badge-red' : item.confidence < 0.7 ? 'badge-amber' : 'badge-blue'}`}>
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm text-slate-400">{item.reason}</p>
                {item.field_value && (
                  <p className="text-sm mt-1">Value: <span className="font-mono text-blue-400">{item.field_value}</span></p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {selected ? (
              <div className="card sticky top-4">
                <h3 className="font-semibold mb-3">Review: {selected.field_name}</h3>
                <p className="text-sm text-slate-400 mb-4">{selected.reason}</p>
                <label className="text-sm text-slate-400 block mb-1">Notes</label>
                <textarea
                  className="input-field h-24 resize-none mb-4"
                  placeholder="Add review notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="space-y-2">
                  <button onClick={() => handleAction("approved")} className="btn-success w-full">Approve</button>
                  <button onClick={() => handleAction("modified")} className="btn-primary w-full">Approve with Modifications</button>
                  <button onClick={() => handleAction("rejected")} className="btn-danger w-full">Reject &mdash; Needs Correction</button>
                </div>
              </div>
            ) : (
              <div className="card text-center py-8">
                <span className="text-3xl block mb-2">{"\ud83d\udc48"}</span>
                <p className="text-slate-400 text-sm">Select an item to review</p>
              </div>
            )}

            <div className="card">
              <h3 className="font-semibold text-sm mb-3">Queue Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pending</span>
                  <span className="text-amber-400">{items.filter(i => i.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved</span>
                  <span className="text-emerald-400">{items.filter(i => i.status === 'approved').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rejected</span>
                  <span className="text-red-400">{items.filter(i => i.status === 'rejected').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
