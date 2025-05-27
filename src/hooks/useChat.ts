
import { useState, useEffect } from "react";
import { Message } from "@/shared/ai/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
      role: "assistant",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    apiKey: "",
    apiType: "gemini" as 'openai' | 'gemini',
    useCustomKey: false
  });

  // Load saved settings on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('aiApiKey') || "";
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || "gemini";
    const savedUseCustomKey = localStorage.getItem('useCustomKey') === "true";
    
    setApiSettings({
      apiKey: savedApiKey,
      apiType: savedApiType,
      useCustomKey: savedUseCustomKey
    });
  }, []);

  const updateApiSettings = (settings: {
    apiKey?: string;
    apiType?: 'openai' | 'gemini';
    useCustomKey?: boolean;
  }) => {
    setApiSettings(prev => ({
      ...prev,
      ...settings
    }));
    
    // Save settings to localStorage for persistence
    if (settings.apiKey !== undefined) localStorage.setItem('aiApiKey', settings.apiKey);
    if (settings.apiType !== undefined) localStorage.setItem('aiApiType', settings.apiType);
    if (settings.useCustomKey !== undefined) localStorage.setItem('useCustomKey', settings.useCustomKey.toString());
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      console.log("Sending message to chat-about-coffee function");
      
      // Prepare request body with messages and API settings
      const requestBody: any = { 
        messages: [...messages, { content: userMessage, role: "user" }],
        apiType: apiSettings.apiType
      };
      
      // Add custom API key if enabled
      if (apiSettings.useCustomKey && apiSettings.apiKey) {
        requestBody.customApiKey = apiSettings.apiKey;
      }

      console.log("Request body:", requestBody);

      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: requestBody
      });

      console.log("Response data:", data);
      console.log("Response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to get response from chat service");
      }

      if (!data || !data.completion) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from chat service");
      }

      setMessages((prev) => [
        ...prev,
        { content: data.completion, role: "assistant" },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      
      let errorMessage = "I'm having trouble responding right now. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage = "API key configuration issue. Please check your settings or try using your own API key.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network connection issue. Please check your internet connection and try again.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev,
        { 
          content: "Sorry, I encountered an error. Please try again or check your API settings.", 
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
