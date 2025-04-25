
import { useState } from "react";
import { Message } from "@/shared/ai/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
      role: "assistant",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: { messages: [...messages, { content: userMessage, role: "user" }] }
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { content: data.completion, role: "assistant" },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      
      toast({
        title: "Error",
        description: "I'm having trouble responding right now. Please try again.",
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev,
        { 
          content: "Sorry, I encountered an error. Please try again.", 
          role: "assistant" 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
        role: "assistant",
      },
    ]);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    resetChat
  };
}
