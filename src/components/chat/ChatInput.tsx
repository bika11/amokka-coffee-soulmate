
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { memo, useCallback, useRef } from "react";
import { recordInteraction } from "@/utils/performance";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
}

export const ChatInput = memo(({
  input,
  setInput,
  handleSendMessage,
  isLoading,
}: ChatInputProps) => {
  // Create a ref for the interaction recorder to ensure it's stable across renders
  const recordSendMessageRef = useRef(recordInteraction('send_message'));
  
  const handleSend = useCallback(() => {
    if (isLoading || !input.trim()) return;
    
    // Use the recorder function from the ref
    const endRecord = recordSendMessageRef.current;
    handleSendMessage();
    // Call the function returned by recordInteraction
    endRecord();
  }, [handleSendMessage, input, isLoading]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, [setInput]);

  return (
    <div className="p-3 border-t">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={handleChange}
          placeholder="Ask about our coffees..."
          className="min-h-0 h-10 resize-none"
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
