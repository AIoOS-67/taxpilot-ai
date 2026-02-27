const STEPS = [
  { key: "intake", label: "Personal Info", icon: "\ud83d\udc64" },
  { key: "classifying", label: "Income", icon: "\ud83d\udcbc" },
  { key: "deductions", label: "Deductions", icon: "\ud83d\udcdd" },
  { key: "form_building", label: "Form 1040", icon: "\ud83d\udccb" },
  { key: "review", label: "Review", icon: "\u2705" },
];

export default function ProgressTracker({ currentStep }: { currentStep: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 transition-all ${
                  idx < activeIdx
                    ? "bg-emerald-600"
                    : idx === activeIdx
                    ? "bg-blue-600 ring-2 ring-blue-400/30 ring-offset-2 ring-offset-slate-900"
                    : "bg-slate-700"
                }`}
              >
                {idx < activeIdx ? "\u2713" : step.icon}
              </div>
              <span className={`text-[10px] sm:text-xs ${idx <= activeIdx ? "text-white" : "text-slate-500"}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`hidden sm:block w-12 lg:w-20 h-0.5 mx-1 ${idx < activeIdx ? "bg-emerald-600" : "bg-slate-700"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
