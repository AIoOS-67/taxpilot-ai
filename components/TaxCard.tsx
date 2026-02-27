import { BridgeCard } from "@/lib/types";

const CARD_STYLES: Record<string, { icon: string; gradient: string; border: string }> = {
  income_card: { icon: "\ud83d\udcb0", gradient: "from-blue-950/40 to-transparent", border: "border-blue-700/30" },
  deduction_card: { icon: "\ud83d\udcdd", gradient: "from-amber-950/40 to-transparent", border: "border-amber-700/30" },
  refund_card: { icon: "\ud83d\udcb5", gradient: "from-emerald-950/40 to-transparent", border: "border-emerald-700/30" },
  review_card: { icon: "\u26a0\ufe0f", gradient: "from-amber-950/40 to-transparent", border: "border-amber-700/30" },
  progress_card: { icon: "\ud83d\udcca", gradient: "from-cyan-950/40 to-transparent", border: "border-cyan-700/30" },
};

export default function TaxCard({ card }: { card: BridgeCard }) {
  const style = CARD_STYLES[card.type] || CARD_STYLES.progress_card;

  if (card.type === "progress_card") {
    const { step, total, label } = card.data as { step: number; total: number; label: string };
    const pct = (step / total) * 100;
    return (
      <div className={`card bg-gradient-to-b ${style.gradient} ${style.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <span>{style.icon}</span>
          <span className="text-xs font-medium text-cyan-400">{card.title}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>{label}</span>
          <span>Step {step} of {total}</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (card.type === "refund_card") {
    const d = card.data as Record<string, number>;
    return (
      <div className={`card bg-gradient-to-b ${style.gradient} ${style.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <span>{style.icon}</span>
          <span className="text-xs font-medium text-emerald-400">{card.title}</span>
        </div>
        <div className="text-center py-2">
          <p className="text-3xl font-bold text-emerald-400">${d.refund?.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Estimated Federal Refund</p>
        </div>
        <div className="space-y-1 mt-3 text-xs">
          {d.gross_income != null && <div className="flex justify-between"><span className="text-slate-500">Income</span><span>${d.gross_income.toLocaleString()}</span></div>}
          {d.deductions != null && <div className="flex justify-between"><span className="text-slate-500">Deductions</span><span>-${d.deductions.toLocaleString()}</span></div>}
          {d.federal_tax != null && <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>${d.federal_tax.toLocaleString()}</span></div>}
          {d.withheld != null && <div className="flex justify-between"><span className="text-slate-500">Withheld</span><span>${d.withheld.toLocaleString()}</span></div>}
        </div>
      </div>
    );
  }

  if (card.type === "review_card") {
    const d = card.data as { field: string; reason: string; confidence: number };
    return (
      <div className={`card bg-gradient-to-b ${style.gradient} ${style.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <span>{style.icon}</span>
          <span className="text-xs font-medium text-amber-400">{card.title}</span>
        </div>
        <p className="text-sm font-medium mb-1">{d.field}</p>
        <p className="text-xs text-slate-400">{d.reason}</p>
        <div className="mt-2 text-xs text-slate-500">
          AI Confidence: {Math.round(d.confidence * 100)}% &mdash; Flagged for EA review
        </div>
      </div>
    );
  }

  // Generic card (income, deduction)
  const entries = Object.entries(card.data).filter(([, v]) => v !== null && v !== undefined);
  return (
    <div className={`card bg-gradient-to-b ${style.gradient} ${style.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <span>{style.icon}</span>
        <span className="text-xs font-medium">{card.title}</span>
      </div>
      <div className="space-y-1.5 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-slate-400 capitalize">{key.replace(/_/g, " ")}</span>
            <span className="font-medium">
              {typeof value === "number"
                ? value > 100
                  ? `$${value.toLocaleString()}`
                  : String(value)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
