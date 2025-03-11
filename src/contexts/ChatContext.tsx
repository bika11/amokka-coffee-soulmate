
import React, { createContext, useContext, useState, useEffect } from "react";
import { Message } from "@/interfaces/ai-client.interface";
import { useToast } from "@/components/ui/use-toast";
import { createAIClient } from "@/services/ai-client.factory";

interface ChatContextType {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  sendMessage: () => Promise<void>;
  resetChat: () => void;
  apiSettings: {
    apiKey: string;
    apiType: 'openai' | 'gemini';
    useCustomKey: boolean;
  };
  updateApiSettings: (settings: {
    apiKey?: string;
    apiType?: 'openai' | 'gemini';
    useCustomKey?: boolean;
  }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    apiKey: "",
    apiType: 'gemini' as const,
    useCustomKey: false
  });
  const { toast } = useToast();

  // Load saved API settings on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('aiApiKey') || "";
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || 'gemini';
    
    setApiSettings({
      apiKey: savedApiKey,
      apiType: savedApiType,
      useCustomKey: !!savedApiKey
    });
    
    // Initialize chat with welcome message
    setMessages([
      {
        content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
        role: "assistant",
      },
    ]);
  }, []);

  const updateApiSettings = (settings: {
    apiKey?: string;
    apiType?: 'openai' | 'gemini';
    useCustomKey?: boolean;
  }) => {
    const newSettings = { ...apiSettings, ...settings };
    
    // Save settings to local storage based on useCustomKey flag
    if (newSettings.useCustomKey && newSettings.apiKey) {
      localStorage.setItem('aiApiKey', newSettings.apiKey);
      localStorage.setItem('aiApiType', newSettings.apiType);
    } else {
      // Clear saved API key to use Edge Function
      localStorage.removeItem('aiApiKey');
      localStorage.setItem('aiApiType', newSettings.apiType);
    }
    
    setApiSettings(newSettings);
  };

  const resetChat = () => {
    setMessages([
      {
        content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
        role: "assistant",
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      // Create AI client (will use Edge Function if no API key is provided)
      const aiClient = createAIClient(
        apiSettings.apiType, 
        apiSettings.useCustomKey ? apiSettings.apiKey : undefined
      );

      const updatedMessages = [
        ...messages,
        { content: userMessage, role: "user" as const }
      ];

      console.log("Sending message to AI client", {
        messageCount: updatedMessages.length,
        apiType: apiSettings.apiType,
        useEdgeFunction: !apiSettings.useCustomKey
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

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        input, 
        setInput, 
        isLoading, 
        sendMessage, 
        resetChat, 
        apiSettings,
        updateApiSettings
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
