
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  isTyping?: boolean;
  progressPercentage?: number;
}

export const ChatInput = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
  isTyping = false,
  progressPercentage = 0,
}: ChatInputProps) => {
  return (
    <div className="p-3 border-t">
      {(isLoading || isTyping) && (
        <div className="mb-2">
          <Progress value={progressPercentage} className="h-1" />
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about our coffees..."
          className="min-h-0 h-10 resize-none"
          disabled={isLoading || isTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={isLoading || isTyping || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
