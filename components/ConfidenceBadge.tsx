interface ConfidenceBadgeProps {
  score: number;
}

export default function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const pct = Math.round(score * 100);

  let color = "badge-red";
  let label = "Low";
  if (pct >= 85) {
    color = "badge-green";
    label = "High";
  } else if (pct >= 60) {
    color = "badge-amber";
    label = "Medium";
  }

  return (
    <div className={color}>
      <svg className="w-3 h-3 mr-1" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray={`${pct * 0.314} 100`}
          transform="rotate(-90 6 6)"
        />
      </svg>
      {label} ({pct}%)
    </div>
  );
}
