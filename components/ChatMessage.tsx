import TaxCard from "./TaxCard";
import { ChatMessage as ChatMessageType } from "@/lib/types";

function renderMarkdown(text: string) {
  // Split into lines and process
  return text.split('\n').map((line, lineIdx) => {
    // Process inline formatting: bold, italic, links
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-slate-800 rounded text-cyan-400 text-xs">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });

    // Check if it's a list item
    if (line.match(/^[-\u2022]\s/)) {
      return (
        <div key={lineIdx} className="flex gap-2 ml-1">
          <span className="text-slate-500 mt-0.5">&bull;</span>
          <span>{parts.slice(0)}</span>
        </div>
      );
    }
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)?.[1];
      return (
        <div key={lineIdx} className="flex gap-2 ml-1">
          <span className="text-slate-500 min-w-[1.2em] text-right">{num}.</span>
          <span>{parts}</span>
        </div>
      );
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return <div key={lineIdx}>{parts}</div>;
  });
}

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}>
      <div className="space-y-2 max-w-[85%]">
        <div className={isUser ? "chat-bubble-user" : "chat-bubble-assistant"}>
          <div className="text-sm leading-relaxed">
            {renderMarkdown(message.content)}
          </div>
        </div>
        {message.cards?.map((card, idx) => (
          <TaxCard key={idx} card={card} />
        ))}
        <p className={`text-[10px] ${isUser ? 'text-right' : 'text-left'} text-slate-600 px-1`}>
          {time}
        </p>
      </div>
    </div>
  );
}
