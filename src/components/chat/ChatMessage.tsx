
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isTyping?: boolean;
}

export const ChatMessage = ({ content, isUser, isTyping = false }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "py-2 px-3 rounded-lg max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">
          {content}
          {isTyping && (
            <span className="inline-block w-1 h-4 ml-1 bg-current animate-blink" />
          )}
        </p>
      </div>
    </div>
  );
};
