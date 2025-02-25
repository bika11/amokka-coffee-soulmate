
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
      // Get the current session
      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { data, error } = await supabase.functions.invoke("chat-about-coffee", {
        body: { 
          message: userMessage,
          history: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        if (error.message?.includes('high traffic')) {
          throw new Error('We are experiencing high traffic. Please try again in a few minutes.');
        }
        throw error;
      }

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
    <div className="fixed bottom-4 right-4 z-50">
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
