
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Message } from "@/interfaces/ai-client.interface";
import { useToast } from "@/components/ui/use-toast";
import { createAIClient } from "@/services/ai-client.factory";
import { handleError } from "@/utils/error-handler";

interface ChatContextType {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  // For progressive loading UI
  isTyping: boolean;
  progressPercentage: number;
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
  const [isTyping, setIsTyping] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [apiSettings, setApiSettings] = useState({
    apiKey: "",
    apiType: 'gemini' as 'openai' | 'gemini',
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

  // Simulate typing effect for responses (progressive loading)
  const simulateTypingEffect = useCallback((response: string) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      
      let typedResponse = '';
      const words = response.split(' ');
      const totalWords = words.length;
      let currentWordIndex = 0;
      
      // Typing speed variables - adjust these for faster/slower typing
      const baseDuration = 1500; // Total base animation time in ms
      const variability = 0.3; // Random variability factor (0.3 = ±30%)
      
      const minDelay = 15; // Minimum delay between words in ms
      const maxDelay = 60; // Maximum delay between words in ms
      
      // Calculate base delay between words
      const baseDelay = Math.min(
        maxDelay,
        Math.max(minDelay, baseDuration / totalWords)
      );
      
      // Add a word with a random delay
      const typeNextWord = () => {
        if (currentWordIndex < totalWords) {
          // Add the next word
          typedResponse += (currentWordIndex > 0 ? ' ' : '') + words[currentWordIndex];
          
          // Update the message in state
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: typedResponse
            };
            return newMessages;
          });
          
          // Update progress percentage
          const progress = Math.round((currentWordIndex / totalWords) * 100);
          setProgressPercentage(progress);
          
          // Move to next word
          currentWordIndex++;
          
          // Calculate random delay for next word with variability
          const randomFactor = 1 - variability + (Math.random() * variability * 2);
          const delay = Math.round(baseDelay * randomFactor);
          
          // Schedule next word
          setTimeout(typeNextWord, delay);
        } else {
          // Finished typing
          setProgressPercentage(100);
          setIsTyping(false);
          resolve();
        }
      };
      
      // Start typing effect
      typeNextWord();
    });
  }, []);

  const updateApiSettings = useCallback((settings: {
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
  }, [apiSettings]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
        role: "assistant",
      },
    ]);
    setProgressPercentage(0);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);
    setProgressPercentage(0);

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

      // Add placeholder for assistant's response
      setMessages(prev => [
        ...prev,
        { content: '', role: "assistant" }
      ]);

      // Get AI response
      const response = await aiClient.getCompletion(updatedMessages);
      
      // Apply typing effect for better UX
      await simulateTypingEffect(response);
    } catch (error) {
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.content !== ''));
      
      // Use centralized error handling
      handleError(error, "I apologize, but I'm having trouble responding right now.", {
        title: "AI Chat Error",
        showToast: true,
      });
    } finally {
      setIsLoading(false);
      setProgressPercentage(0);
    }
  }, [input, messages, apiSettings, simulateTypingEffect]);

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        input, 
        setInput, 
        isLoading,
        isTyping,
        progressPercentage, 
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
