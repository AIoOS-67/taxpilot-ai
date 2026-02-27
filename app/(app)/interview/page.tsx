"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import { ChatMessage as ChatMessageType } from "@/lib/types";

export default function InterviewPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
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
            content: "Welcome to TaxPilot AI! I'm your personal tax filing assistant. I'll help you prepare your 2025 federal tax return step by step.\n\nLet's start \u2014 what's your name and filing status?",
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

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      session_id: sessionId || "",
      role: "user",
      content: input.trim(),
      cards: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMessage.content }),
      });

      const data = await res.json();

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg">
          &#9992;&#65039;
        </div>
        <div>
          <h1 className="font-semibold">TaxPilot AI</h1>
          <p className="text-xs text-slate-500">
            {loading ? "Thinking..." : "Powered by Gradient AI"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="chat-bubble-assistant w-16">
            <div className="flex gap-1.5 items-center justify-center py-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

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
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary px-6">
          Send
        </button>
      </div>
    </div>
  );
}
