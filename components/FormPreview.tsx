"use client";

interface FormPreviewProps {
  result: {
    filing_status: string;
    gross_income: number;
    deductions: number;
    taxable_income: number;
    federal_tax: number;
    credits: number;
    total_withheld: number;
    estimated_refund: number;
  };
}

function Line({ num, label, value, bold, green }: {
  num: string; label: string; value: number; bold?: boolean; green?: boolean;
}) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}>
      <span>
        <span className="text-slate-600 inline-block w-8">{num}.</span>
        <span className="text-slate-400">{label}</span>
      </span>
      <span className={`${green ? 'text-emerald-400' : ''} tabular-nums`}>
        ${value.toLocaleString()}
      </span>
    </div>
  );
}

export default function FormPreview({ result }: FormPreviewProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Form 1040 Preview</h3>
        <span className="badge-blue">2025 Tax Year</span>
      </div>

      <div className="bg-white/5 rounded-lg p-4 font-mono text-xs space-y-3 border border-slate-700">
        <div className="text-center border-b border-slate-600 pb-2">
          <p className="font-bold text-sm">Form 1040 &mdash; U.S. Individual Income Tax Return</p>
          <p className="text-slate-500">Department of the Treasury &mdash; Internal Revenue Service</p>
          <p className="text-slate-500">OMB No. 1545-0074 | Tax Year 2025</p>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">1. Filing Status</span>
          <span>{result.filing_status}</span>
        </div>

        <div className="border-t border-slate-700 pt-2">
          <p className="text-slate-500 mb-2 font-semibold">Income</p>
          <div className="space-y-1.5">
            <Line num="1a" label="Wages, salaries, tips (W-2)" value={result.gross_income} />
            <Line num="9" label="Total income" value={result.gross_income} bold />
          </div>
        </div>

        <div className="border-t border-slate-700 pt-2">
          <p className="text-slate-500 mb-2 font-semibold">Deductions</p>
          <div className="space-y-1.5">
            <Line num="13" label="Standard deduction or itemized" value={result.deductions} />
            <Line num="15" label="Taxable income" value={result.taxable_income} bold />
          </div>
        </div>

        <div className="border-t border-slate-700 pt-2">
          <p className="text-slate-500 mb-2 font-semibold">Tax and Credits</p>
          <div className="space-y-1.5">
            <Line num="16" label="Tax" value={result.federal_tax} />
            <Line num="19" label="Nonrefundable credits" value={result.credits} />
          </div>
        </div>

        <div className="border-t border-slate-700 pt-2">
          <p className="text-slate-500 mb-2 font-semibold">Payments</p>
          <div className="space-y-1.5">
            <Line num="25a" label="Federal income tax withheld (W-2)" value={result.total_withheld} />
            <Line num="33" label="Total payments" value={result.total_withheld} bold />
          </div>
        </div>

        <div className="border-t-2 border-emerald-700 pt-2">
          <Line num="34" label="Overpayment (REFUND)" value={result.estimated_refund} bold green />
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-3 text-center">
        This is a simplified preview. Actual IRS Form 1040 contains additional lines and schedules.
      </p>
    </div>
  );
}
