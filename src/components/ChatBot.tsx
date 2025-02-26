
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "./chat/ChatMessage";
import { ChatInput } from "./chat/ChatInput";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatButton } from "./chat/ChatButton";
import { LoadingDots } from "./chat/LoadingDots";

interface Message {
  content: string;
  isUser: boolean;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleChat = () => {
    if (!isOpen) {
      setMessages([
        {
          content: "Hi! I'm your coffee expert. I can help you learn about our coffees and find the perfect match for your taste. What would you like to know?",
          isUser: false,
        },
      ]);
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      // Make a direct fetch call to the edge function with the anon key
      const response = await fetch('https://htgacpgppyjonzwkkntl.supabase.co/functions/v1/chat-about-coffee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2FjcGdwcHlqb256d2trbnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDIwOTAsImV4cCI6MjA1MzcxODA5MH0.7cubJomcCG2eF0rv79m67XVQedZQ_NIYbYrY4IbSI2Y',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2FjcGdwcHlqb256d2trbnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDIwOTAsImV4cCI6MjA1MzcxODA5MH0.7cubJomcCG2eF0rv79m67XVQedZQ_NIYbYrY4IbSI2Y`
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { content: data.response, isUser: false },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "I apologize, but I'm having trouble responding right now. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4">
      {isOpen ? (
        <Card className="w-80 h-96 flex flex-col shadow-lg animate-fade-in">
          <ChatHeader onClose={handleToggleChat} />
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
            {isLoading && <LoadingDots />}
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </Card>
      ) : (
        <ChatButton onClick={handleToggleChat} isBouncing={false} />
      )}
    </div>
  );
};
