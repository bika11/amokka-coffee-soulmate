
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/interfaces/ai-client.interface";
import { createAIClient } from "@/services/ai-client.factory";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializeChat = () => {
    setMessages([
      {
        content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
        role: "assistant",
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      // Get the saved API key and type (if any)
      const savedApiKey = localStorage.getItem('aiApiKey');
      const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || 'gemini';
      
      // Create AI client (will use Edge Function if no API key is provided)
      const aiClient = createAIClient(savedApiType, savedApiKey || undefined);

      const updatedMessages = [
        ...messages,
        { content: userMessage, role: "user" as const }
      ];

      console.log("Sending message to AI client", {
        messageCount: updatedMessages.length,
        apiType: savedApiType,
        useEdgeFunction: !savedApiKey
      });

      const response = await aiClient.getCompletion(updatedMessages);

      setMessages((prev) => [
        ...prev,
        { content: response, role: "assistant" },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "I apologize, but I'm having trouble responding right now.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    initializeChat,
    handleSendMessage,
  };
}
