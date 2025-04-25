
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
  const [apiSettings, setApiSettings] = useState({
    apiKey: "",
    apiType: "gemini" as 'openai' | 'gemini',
    useCustomKey: false
  });

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
  
  // Load saved settings on component mount
  useState(() => {
    const savedApiKey = localStorage.getItem('aiApiKey') || "";
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || "gemini";
    const savedUseCustomKey = localStorage.getItem('useCustomKey') === "true";
    
    setApiSettings({
      apiKey: savedApiKey,
      apiType: savedApiType,
      useCustomKey: savedUseCustomKey
    });
  });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      // Prepare request body with messages and API settings
      const requestBody: any = { 
        messages: [...messages, { content: userMessage, role: "user" }],
        apiType: apiSettings.apiType
      };
      
      // Add custom API key if enabled
      if (apiSettings.useCustomKey && apiSettings.apiKey) {
        requestBody.customApiKey = apiSettings.apiKey;
      }

      const { data, error } = await supabase.functions.invoke('chat-about-coffee', {
        body: requestBody
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
        description: "I'm having trouble responding right now. Please try again or check your API settings.",
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
