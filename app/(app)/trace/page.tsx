"use client";

import { useState, useEffect } from "react";

interface TraceStep {
  node: string;
  label: string;
  color: string;
  status: "completed" | "active" | "pending";
  duration: number;
  input: string;
  output: string;
  model?: string;
  tokens?: { input: number; output: number };
  tools?: string[];
}

const DEMO_TRACE: TraceStep[] = [
  {
    node: "intake",
    label: "Intake Agent",
    color: "cyan",
    status: "completed",
    duration: 1.2,
    input: "User: I'm filing as Single with $75,000 W-2 income",
    output: "Extracted: filing_status=single, income_type=w2, gross_income=$75,000",
    model: "Llama 3.3 70B",
    tokens: { input: 342, output: 89 },
    tools: ["extract_personal_info", "validate_filing_status"],
  },
  {
    node: "classifier",
    label: "Income Classifier",
    color: "blue",
    status: "completed",
    duration: 0.8,
    input: "income_type=w2, gross_income=$75,000, employer=Demo Employer Inc.",
    output: "Classification: W-2 wages, federal_withheld=$12,500, state_withheld=$3,750",
    model: "Llama 3.3 70B",
    tokens: { input: 215, output: 67 },
    tools: ["classify_income", "extract_w2_fields"],
  },
  {
    node: "deduction",
    label: "Deduction Finder (RAG)",
    color: "amber",
    status: "completed",
    duration: 2.1,
    input: "filing_status=single, gross_income=$75,000, itemized_deductions=[]",
    output: "Recommendation: standard_deduction=$15,000 (exceeds itemized), potential_credits: student_loan_interest",
    model: "Llama 3.3 70B + Knowledge Base RAG",
    tokens: { input: 1842, output: 256 },
    tools: ["query_knowledge_base", "calculate_standard_deduction", "find_credits"],
  },
  {
    node: "form_builder",
    label: "Form 1040 Builder",
    color: "purple",
    status: "completed",
    duration: 1.5,
    input: "taxable_income=$60,000, standard_deduction=$15,000, withheld=$12,500",
    output: "Form 1040: tax=$8,817, refund=$3,683, effective_rate=11.76%",
    model: "Llama 3.3 70B",
    tokens: { input: 478, output: 312 },
    tools: ["calculate_federal_tax", "compute_refund", "generate_form_1040"],
  },
  {
    node: "review",
    label: "Review & HITL Gate",
    color: "emerald",
    status: "active",
    duration: 0.6,
    input: "confidence_score=0.92, all_fields_complete=true",
    output: "Flagged: filing_status_optimization (confidence=0.68) → Routed to EA Darren for review",
    model: "Llama 3.3 70B",
    tokens: { input: 156, output: 98 },
    tools: ["calculate_confidence", "flag_for_review", "notify_reviewer"],
  },
];

export default function TracePage() {
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<TraceStep | null>(null);

  useEffect(() => {
    // Animate steps appearing one by one
    DEMO_TRACE.forEach((step, idx) => {
      setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        if (idx === DEMO_TRACE.length - 1) {
          setSelectedStep(step);
        }
      }, idx * 600);
    });
  }, []);

  const totalDuration = DEMO_TRACE.reduce((sum, s) => sum + s.duration, 0);
  const totalTokens = DEMO_TRACE.reduce((sum, s) => sum + (s.tokens?.input || 0) + (s.tokens?.output || 0), 0);

  const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    cyan: { bg: "bg-cyan-950/30", border: "border-cyan-700/50", text: "text-cyan-400", dot: "bg-cyan-400" },
    blue: { bg: "bg-blue-950/30", border: "border-blue-700/50", text: "text-blue-400", dot: "bg-blue-400" },
    amber: { bg: "bg-amber-950/30", border: "border-amber-700/50", text: "text-amber-400", dot: "bg-amber-400" },
    purple: { bg: "bg-purple-950/30", border: "border-purple-700/50", text: "text-purple-400", dot: "bg-purple-400" },
    emerald: { bg: "bg-emerald-950/30", border: "border-emerald-700/50", text: "text-emerald-400", dot: "bg-emerald-400" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Agent Tracing</h1>
        <p className="text-slate-400 text-sm">DigitalOcean Gradient Agent Tracing &mdash; Pipeline Execution Log</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Nodes Executed</p>
          <p className="text-xl font-bold">{steps.length}/5</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Total Duration</p>
          <p className="text-xl font-bold">{totalDuration.toFixed(1)}s</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Total Tokens</p>
          <p className="text-xl font-bold">{totalTokens.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Confidence</p>
          <p className="text-xl font-bold text-emerald-400">92%</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const c = colorMap[step.color] || colorMap.cyan;
          const isSelected = selectedStep?.node === step.node;
          return (
            <div key={step.node} className="animate-slide-up">
              <div
                onClick={() => setSelectedStep(step)}
                className={`card cursor-pointer transition-all ${isSelected ? `${c.border} ring-1 ring-${step.color}-500/20` : 'hover:border-slate-600'} ${c.bg}`}
                style={{ marginBottom: idx < steps.length - 1 ? 0 : undefined, borderRadius: idx === 0 ? '12px 12px 0 0' : idx === steps.length - 1 ? '0 0 12px 12px' : '0' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-emerald-400' : step.status === 'active' ? `${c.dot} animate-pulse` : 'bg-slate-600'}`} />
                    {idx < steps.length - 1 && <div className="w-0.5 h-4 bg-slate-700 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${c.text}`}>{step.label}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{step.duration}s</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${step.status === 'completed' ? 'bg-emerald-900/50 text-emerald-400' : step.status === 'active' ? 'bg-amber-900/50 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                          {step.status === 'completed' ? 'Done' : step.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{step.output}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedStep && (
        <div className="card animate-fade-in">
          <h3 className={`font-semibold mb-3 ${colorMap[selectedStep.color]?.text || 'text-white'}`}>
            {selectedStep.label} &mdash; Detail
          </h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">Model</p>
              <p className="font-mono text-xs">{selectedStep.model}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Input</p>
              <div className="bg-slate-800/50 rounded-lg p-3 font-mono text-xs text-slate-300">{selectedStep.input}</div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Output</p>
              <div className="bg-slate-800/50 rounded-lg p-3 font-mono text-xs text-slate-300">{selectedStep.output}</div>
            </div>

            {selectedStep.tools && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Tools Called</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStep.tools.map((tool) => (
                    <span key={tool} className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {tool}()
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStep.tokens && (
              <div className="flex gap-4 text-xs">
                <span className="text-slate-500">Input tokens: <span className="text-white">{selectedStep.tokens.input}</span></span>
                <span className="text-slate-500">Output tokens: <span className="text-white">{selectedStep.tokens.output}</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center">
        Agent Tracing powered by DigitalOcean Gradient ADK &bull; LangGraph StateGraph pipeline
      </p>
    </div>
  );
}
