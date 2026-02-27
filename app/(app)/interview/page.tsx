"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import { ChatMessage as ChatMessageType } from "@/lib/types";

const AGENT_NODES: Record<string, { label: string; color: string }> = {
  intake: { label: "Intake Agent", color: "text-cyan-400" },
  classifier: { label: "Classifier Agent", color: "text-blue-400" },
  deduction: { label: "Deduction Finder (RAG)", color: "text-amber-400" },
  form_builder: { label: "Form Builder", color: "text-purple-400" },
  review: { label: "Review & HITL", color: "text-emerald-400" },
};

interface SuggestionChip {
  label: string;
  value: string;
}

function getSuggestions(lastNode: string, messageCount: number): SuggestionChip[] {
  if (messageCount <= 1) {
    return [
      { label: "Single", value: "I'm filing as Single" },
      { label: "Married Filing Jointly", value: "I'm filing as Married Filing Jointly" },
      { label: "Head of Household", value: "I'm filing as Head of Household" },
    ];
  }
  if (lastNode === "intake" && messageCount <= 3) {
    return [
      { label: "I have a W-2", value: "I have a W-2 from my employer. My salary is $75,000." },
      { label: "Self-employed", value: "I'm self-employed with about $85,000 in 1099 income." },
      { label: "Upload W-2 photo", value: "I'd like to upload a photo of my W-2." },
    ];
  }
  if (lastNode === "classifier") {
    return [
      { label: "Find deductions", value: "What deductions can I take?" },
      { label: "I have student loans", value: "I paid $2,400 in student loan interest this year." },
      { label: "Charitable donations", value: "I donated $3,000 to charity this year." },
    ];
  }
  if (lastNode === "deduction") {
    return [
      { label: "Calculate my refund", value: "Yes, please calculate my refund!" },
      { label: "More deductions", value: "Are there any other deductions I should consider?" },
    ];
  }
  return [];
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState("intake");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/session", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setSessionId(data.session_id);
        if (data.messages?.length) {
          setMessages(data.messages);
        } else {
          setMessages([{
            id: "welcome",
            session_id: data.session_id,
            role: "assistant",
            content: "Welcome to TaxPilot AI! I'm your personal tax filing assistant powered by DigitalOcean Gradient AI.\n\nI'll guide you through preparing your 2025 federal tax return step by step. Our multi-agent pipeline will analyze your information, find deductions using IRS knowledge base, and flag anything that needs professional review.\n\nLet's start \u2014 what's your filing status?",
            cards: [{
              type: "progress_card",
              title: "Getting Started",
              data: { step: 1, total: 5, label: "Personal Information" },
            }],
            created_at: new Date().toISOString(),
          }]);
        }
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(overrideMessage?: string) {
    const text = overrideMessage || input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      session_id: sessionId || "",
      role: "user",
      content: text,
      cards: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Add slight delay for realism
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });

      const data = await res.json();

      if (data.state?.current_node) {
        setCurrentNode(data.state.current_node);
      }

      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-resp`,
        session_id: sessionId || "",
        role: "assistant",
        content: data.message,
        cards: data.cards || null,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `msg-${Date.now()}-err`,
        session_id: sessionId || "",
        role: "assistant",
        content: "Sorry, I had trouble processing that. Could you try again?",
        cards: null,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const suggestions = getSuggestions(currentNode, messages.filter(m => m.role === "user").length);
  const nodeInfo = AGENT_NODES[currentNode];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]">
      {/* Header with agent indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg animate-pulse-glow">
          &#9992;&#65039;
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">TaxPilot AI</h1>
          <p className="text-xs text-slate-500">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Processing...
              </span>
            ) : (
              "Powered by Gradient AI \u2022 Llama 3.3 70B"
            )}
          </p>
        </div>
        {/* Agent node badge */}
        {nodeInfo && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${loading ? 'animate-pulse' : ''} ${
              currentNode === 'intake' ? 'bg-cyan-400' :
              currentNode === 'classifier' ? 'bg-blue-400' :
              currentNode === 'deduction' ? 'bg-amber-400' :
              currentNode === 'form_builder' ? 'bg-purple-400' :
              'bg-emerald-400'
            }`} />
            <span className={`text-xs font-medium ${nodeInfo.color}`}>
              {nodeInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="chat-bubble-assistant w-16 animate-slide-up">
            <div className="flex gap-1.5 items-center justify-center py-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion chips */}
      {!loading && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-3 animate-fade-in">
          {suggestions.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.value)}
              className="px-3 py-1.5 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-slate-800">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          className="input-field flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="btn-primary px-6">
          Send
        </button>
      </div>
    </div>
  );
}
