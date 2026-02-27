"use client";

import { useState, useEffect } from "react";

interface ReviewItemView {
  id: string;
  field_name: string;
  reason: string;
  confidence: number;
  status: string;
  reviewer_notes: string | null;
  resolved_at: string | null;
}

export default function ReviewStatusPage() {
  const [items, setItems] = useState<ReviewItemView[]>([]);

  useEffect(() => {
    fetch("/api/review")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {
        setItems([
          {
            id: "1",
            field_name: "Filing Status Optimization",
            reason: "You may qualify for Head of Household status which could save an additional $1,200",
            confidence: 0.68,
            status: "pending",
            reviewer_notes: null,
            resolved_at: null,
          },
          {
            id: "2",
            field_name: "Education Credits",
            reason: "Student loan interest deduction may apply based on income level",
            confidence: 0.55,
            status: "approved",
            reviewer_notes: "Confirmed - standard deduction is still optimal for this filer.",
            resolved_at: "2026-02-27T10:30:00Z",
          },
        ]);
      });
  }, []);

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending Review", cls: "badge-amber" },
    approved: { label: "Approved", cls: "badge-green" },
    rejected: { label: "Needs Correction", cls: "badge-red" },
    modified: { label: "Modified", cls: "badge-blue" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Review Status</h1>
        <p className="text-slate-400 text-sm">Items flagged for professional review</p>
      </div>

      <div className="card bg-blue-950/20 border-blue-900/50">
        <div className="flex gap-3">
          <span className="text-lg">{"\ud83d\udc68\u200d\ud83d\udcbc"}</span>
          <div className="text-sm">
            <p className="text-blue-300 font-medium">Your Reviewer</p>
            <p className="text-slate-400">Darren &mdash; Licensed Enrolled Agent (EA) &amp; Master Tax Advisor at H&amp;R Block</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl block mb-3">{"\u2705"}</span>
          <p className="text-slate-300">No items pending review</p>
          <p className="text-sm text-slate-500">All flagged items have been resolved</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{item.field_name}</h3>
                <span className={statusConfig[item.status]?.cls || "badge"}>
                  {statusConfig[item.status]?.label || item.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{item.reason}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>AI Confidence: {Math.round(item.confidence * 100)}%</span>
                {item.resolved_at && (
                  <span>Resolved: {new Date(item.resolved_at).toLocaleDateString()}</span>
                )}
              </div>
              {item.reviewer_notes && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-sm">
                  <p className="text-xs text-slate-500 mb-1">Reviewer Notes:</p>
                  <p className="text-slate-300">{item.reviewer_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
