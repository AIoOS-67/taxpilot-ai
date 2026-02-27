import TaxCard from "./TaxCard";
import { ChatMessage as ChatMessageType } from "@/lib/types";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}>
      <div className="space-y-2 max-w-[85%]">
        <div className={isUser ? "chat-bubble-user" : "chat-bubble-assistant"}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        </div>
        {message.cards?.map((card, idx) => (
          <TaxCard key={idx} card={card} />
        ))}
      </div>
    </div>
  );
}
