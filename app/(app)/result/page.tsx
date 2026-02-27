"use client";

import { useState, useEffect } from "react";
import FormPreview from "@/components/FormPreview";
import ConfidenceBadge from "@/components/ConfidenceBadge";

interface TaxResult {
  filing_status: string;
  gross_income: number;
  deductions: number;
  taxable_income: number;
  federal_tax: number;
  credits: number;
  total_withheld: number;
  estimated_refund: number;
  confidence_score: number;
  needs_review: boolean;
}

export default function ResultPage() {
  const [result, setResult] = useState<TaxResult | null>(null);

  useEffect(() => {
    fetch("/api/tax-return")
      .then((r) => r.json())
      .then((data) => setResult(data.result))
      .catch(() => {
        setResult({
          filing_status: "Single",
          gross_income: 75000,
          deductions: 15000,
          taxable_income: 60000,
          federal_tax: 8817,
          credits: 0,
          total_withheld: 12500,
          estimated_refund: 3683,
          confidence_score: 0.92,
          needs_review: true,
        });
      });
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3" />
          <p className="text-slate-400">Loading your tax return...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tax Return Results</h1>
          <p className="text-slate-400 text-sm">Tax Year 2025 &mdash; Federal Return</p>
        </div>
        <ConfidenceBadge score={result.confidence_score} />
      </div>

      <div className="card text-center py-8 border-emerald-700/30 bg-gradient-to-b from-emerald-950/30 to-transparent">
        <p className="text-sm text-slate-400 mb-1">Estimated Federal Refund</p>
        <p className="text-5xl font-bold text-emerald-400 mb-2">
          ${result.estimated_refund.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500">Based on information provided</p>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-lg mb-2">Return Summary</h3>
        {[
          { label: "Filing Status", value: result.filing_status },
          { label: "Gross Income", value: `$${result.gross_income.toLocaleString()}` },
          { label: "Deductions", value: `-$${result.deductions.toLocaleString()}`, color: "text-amber-400" },
          { label: "Taxable Income", value: `$${result.taxable_income.toLocaleString()}`, bold: true },
          { label: "Federal Tax", value: `$${result.federal_tax.toLocaleString()}` },
          { label: "Credits", value: `-$${result.credits.toLocaleString()}`, color: "text-emerald-400" },
          { label: "Total Withheld", value: `$${result.total_withheld.toLocaleString()}` },
        ].map((row) => (
          <div key={row.label} className={`flex justify-between text-sm ${row.bold ? 'font-semibold border-t border-slate-700 pt-2' : ''}`}>
            <span className="text-slate-400">{row.label}</span>
            <span className={row.color || ''}>{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between text-lg font-bold border-t border-slate-600 pt-3">
          <span>Estimated Refund</span>
          <span className="text-emerald-400">${result.estimated_refund.toLocaleString()}</span>
        </div>
      </div>

      {result.needs_review && (
        <div className="card border-amber-700/50 bg-amber-950/20">
          <div className="flex gap-3">
            <span className="text-lg">{"\u26a0\ufe0f"}</span>
            <div className="text-sm">
              <p className="text-amber-300 font-medium mb-1">Pending Professional Review</p>
              <p className="text-slate-400">
                Some items have been flagged for review by our licensed Enrolled Agent.
                You&apos;ll be notified once the review is complete.
              </p>
              <a href="/review-status" className="text-blue-400 hover:underline mt-1 inline-block">
                View review status &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      <FormPreview result={result} />
    </div>
  );
}
