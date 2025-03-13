
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
    try {
      console.log("Initializing AI client with settings:", {
        apiType: apiSettings.apiType,
        useCustomKey: apiSettings.useCustomKey
      });
      
      const client = createAIClient(
        apiSettings.apiType,
        apiSettings.useCustomKey ? apiSettings.apiKey : undefined
      );
      setAiClient(client);
    } catch (error) {
      console.error("Error initializing AI client:", error);
      toast({
        title: "AI Client Error",
        description: "Failed to initialize the AI client. Please check your settings.",
        variant: "destructive",
      });
    }
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

      // Use the AI client interface properly with the correct parameter type
      const result = await aiClient.getCompletion({
        messages: updatedMessages,
        temperature: 0.7,
        maxTokens: 1024,
        contextLimit: 2000
      });
      
      if (result.tokens) {
        console.log("Token usage:", result.tokens);
      }

      // Ensure we're adding a message with a string content, not the AICompletionResult object
      setMessages((prev) => [
        ...prev,
        { content: result.completion, role: "assistant" },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      
      let errorMessage = "I apologize, but I'm having trouble responding right now.";
      
      // Provide more specific error messages based on the type of error
      if (error instanceof Error) {
        if (error.message.includes("Edge Function returned a non-2xx status code")) {
          errorMessage = `There was an issue with the AI service. This could be due to the edge function not being deployed correctly. Please try using a different model or your own API key.`;
        } else if (error.message.includes("API key")) {
          errorMessage = `There seems to be an issue with the API key. Please check your settings and try again.`;
        } else if (error.message.includes("rate limit")) {
          errorMessage = `The AI service has reached its rate limit. Please try again later or use a different service.`;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Add a system message to the chat about the error
      setMessages((prev) => [
        ...prev,
        { 
          content: "Sorry, I encountered an error. Please try using a different model in the settings or try again later.", 
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
    resetChat,
    apiSettings,
    updateApiSettings
  };
}
