
import { useState, useEffect } from "react";
import { AIClient, AICompletionResult, Message } from "@/interfaces/ai-client.interface";
import { createAIClient } from "@/services/ai-client.factory";
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
  const [aiClient, setAiClient] = useState<AIClient | null>(null);
  const [apiSettings, setApiSettings] = useState({
    apiKey: localStorage.getItem('aiApiKey') || "",
    apiType: (localStorage.getItem('aiApiType') as 'openai' | 'gemini') || 'gemini',
    useCustomKey: !!localStorage.getItem('aiApiKey')
  });

  // Initialize AI client on component mount or when API settings change
  useEffect(() => {
    const client = createAIClient(
      apiSettings.apiType,
      apiSettings.useCustomKey ? apiSettings.apiKey : undefined
    );
    setAiClient(client);
  }, [apiSettings]);

  const updateApiSettings = (settings: {
    apiKey?: string;
    apiType?: 'openai' | 'gemini';
    useCustomKey?: boolean;
  }) => {
    const newSettings = { ...apiSettings, ...settings };
    
    if (newSettings.useCustomKey && newSettings.apiKey) {
      localStorage.setItem('aiApiKey', newSettings.apiKey);
      localStorage.setItem('aiApiType', newSettings.apiType);
    } else {
      localStorage.removeItem('aiApiKey');
      localStorage.setItem('aiApiType', newSettings.apiType);
    }
    
    setApiSettings(newSettings);
  };

  const sendMessage = async () => {
    if (!input.trim() || !aiClient) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      const updatedMessages = [
        ...messages,
        { content: userMessage, role: "user" as const }
      ];

      console.log("Sending message to AI client", {
        messageCount: updatedMessages.length,
        apiType: apiSettings.apiType,
        useEdgeFunction: !apiSettings.useCustomKey
      });

      // Use the AI client interface properly
      const result = await aiClient.getCompletion({
        messages: updatedMessages,
        temperature: 0.7,
        maxTokens: 1024,
        contextLimit: 2000
      });
      
      if (result.tokens) {
        console.log("Token usage:", result.tokens);
      }

      setMessages((prev) => [
        ...prev,
        { content: result.completion, role: "assistant" },
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
    resetChat,
    apiSettings,
    updateApiSettings
  };
}
